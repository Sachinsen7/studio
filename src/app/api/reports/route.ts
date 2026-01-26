import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Helper function to calculate task statistics
function calculateTaskStats(tasks: any[]) {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'Done').length;
    const inProgress = tasks.filter((t) => t.status === 'InProgress').length;
    const todo = tasks.filter((t) => t.status === 'ToDo').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
        total,
        completed,
        inProgress,
        todo,
        completionRate,
    };
}

// GET /api/reports - Get comprehensive reports
export async function GET(request: NextRequest) {
    try {
        // Fetch all employees with their tasks
        const employees = await db.employee.findMany({
            where: {
                isActive: true,
            },
            include: {
                tasks: {
                    where: {
                        assigneeType: 'Employee',
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        // Fetch all interns with their tasks
        const interns = await db.intern.findMany({
            where: {
                status: {
                    in: ['Active', 'Upcoming'],
                },
            },
            include: {
                tasks: {
                    where: {
                        assigneeType: 'Intern',
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        // Fetch all projects with tasks
        const projects = await db.project.findMany({
            include: {
                tasks: true,
            },
            orderBy: {
                name: 'asc',
            },
        });

        // Process employee reports
        const employeeReports = await Promise.all(
            employees.map(async (employee) => {
                const taskStats = calculateTaskStats(employee.tasks);

                // Parse projects
                let empProjects: string[] = [];
                if (employee.projects) {
                    try {
                        empProjects = JSON.parse(employee.projects);
                    } catch {
                        empProjects = [employee.project];
                    }
                } else if (employee.project && employee.project !== 'Unassigned') {
                    empProjects = [employee.project];
                }

                return {
                    id: employee.id,
                    name: employee.name,
                    email: employee.email,
                    avatarUrl: employee.avatarUrl,
                    role: employee.role,
                    project: employee.project,
                    projects: empProjects,
                    taskStats,
                };
            })
        );

        // Process intern reports
        const internReports = await Promise.all(
            interns.map(async (intern) => {
                const taskStats = calculateTaskStats(intern.tasks);

                // Parse projects
                let internProjects: string[] = [];
                if (intern.projects) {
                    try {
                        internProjects = JSON.parse(intern.projects);
                    } catch {
                        internProjects = [intern.project];
                    }
                } else if (intern.project && intern.project !== 'Unassigned') {
                    internProjects = [intern.project];
                }

                // Get mentor details
                let mentor = null;
                if (intern.mentorId) {
                    const mentorData = await db.employee.findUnique({
                        where: { id: intern.mentorId },
                        select: {
                            id: true,
                            name: true,
                        },
                    });
                    mentor = mentorData;
                }

                return {
                    id: intern.id,
                    name: intern.name,
                    email: intern.email,
                    avatarUrl: intern.avatarUrl,
                    university: intern.university,
                    status: intern.status,
                    project: intern.project,
                    projects: internProjects,
                    taskStats,
                    mentor,
                };
            })
        );

        // Process project reports
        const projectReports = await Promise.all(
            projects.map(async (project) => {
                const taskStats = calculateTaskStats(project.tasks);

                // Get team members for this project
                const projectEmployees = employees.filter((emp) => {
                    let empProjects: string[] = [];
                    if (emp.projects) {
                        try {
                            empProjects = JSON.parse(emp.projects);
                        } catch {
                            empProjects = [emp.project];
                        }
                    } else if (emp.project && emp.project !== 'Unassigned') {
                        empProjects = [emp.project];
                    }
                    return empProjects.includes(project.name);
                });

                const projectInterns = interns.filter((intern) => {
                    let internProjects: string[] = [];
                    if (intern.projects) {
                        try {
                            internProjects = JSON.parse(intern.projects);
                        } catch {
                            internProjects = [intern.project];
                        }
                    } else if (intern.project && intern.project !== 'Unassigned') {
                        internProjects = [intern.project];
                    }
                    return internProjects.includes(project.name);
                });

                // Calculate member stats
                const members = [
                    ...projectEmployees.map((emp) => ({
                        id: emp.id,
                        name: emp.name,
                        type: 'Employee' as const,
                        taskStats: calculateTaskStats(
                            project.tasks.filter(
                                (t) => t.assigneeId === emp.id && t.assigneeType === 'Employee'
                            )
                        ),
                    })),
                    ...projectInterns.map((intern) => ({
                        id: intern.id,
                        name: intern.name,
                        type: 'Intern' as const,
                        taskStats: calculateTaskStats(
                            project.tasks.filter(
                                (t) => t.assigneeId === intern.id && t.assigneeType === 'Intern'
                            )
                        ),
                    })),
                ];

                return {
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    teamSize: members.length,
                    taskStats,
                    members,
                };
            })
        );

        return NextResponse.json({
            employees: employeeReports,
            projects: projectReports,
            interns: internReports,
        });
    } catch (error) {
        console.error('Error generating reports:', error);
        return NextResponse.json(
            { error: 'Failed to generate reports' },
            { status: 500 }
        );
    }
}
