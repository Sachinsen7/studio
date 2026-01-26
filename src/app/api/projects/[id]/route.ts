import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createNotification, NotificationTemplates } from '@/lib/notification-utils';

// GET /api/projects/[id] - Get a specific project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const project = await db.project.findUnique({
            where: { id },
            include: {
                tasks: {
                    include: {
                        assignee: true,
                        intern: true,
                    },
                },
                dailyLogs: {
                    include: {
                        employee: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
                documents: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Get team members
        const teamMembers = await db.employee.findMany({
            where: {
                OR: [
                    { project: project.name },
                    { projects: { contains: `"${project.name}"` } },
                ],
            },
        });

        // Get interns assigned to this project
        const interns = await db.intern.findMany({
            where: {
                OR: [
                    { project: project.name },
                    { projects: { contains: `"${project.name}"` } },
                ],
            },
        });

        return NextResponse.json({
            ...project,
            team: teamMembers,
            interns,
        });
    } catch (error) {
        console.error('Error fetching project:', error);
        return NextResponse.json(
            { error: 'Failed to fetch project' },
            { status: 500 }
        );
    }
}

// PUT /api/projects/[id] - Update a project
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { 
            name, 
            clientName, 
            description, 
            status, 
            startDate, 
            endDate, 
            githubRepo, 
            techStack,
            progress 
        } = body;

        // Check if project exists
        const existingProject = await db.project.findUnique({
            where: { id },
        });

        if (!existingProject) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Update project
        const updatedProject = await db.project.update({
            where: { id },
            data: {
                name: name || existingProject.name,
                clientName,
                description,
                status,
                startDate: startDate ? new Date(startDate) : existingProject.startDate,
                endDate: endDate ? new Date(endDate) : existingProject.endDate,
                githubRepo,
                techStack,
                progress: progress !== undefined ? progress : existingProject.progress,
            },
            include: {
                tasks: true,
            },
        });

        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json(
            { error: 'Failed to update project' },
            { status: 500 }
        );
    }
}

// DELETE /api/projects/[id] - Delete a project with cascading deletion
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // First, get the project details for notifications
        const project = await db.project.findUnique({
            where: { id },
            include: {
                tasks: {
                    include: {
                        assignee: true,
                        intern: true,
                    },
                },
                dailyLogs: {
                    include: {
                        employee: true,
                    },
                },
            },
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Get all employees and interns assigned to this project
        const assignedEmployees = await db.employee.findMany({
            where: {
                OR: [
                    { project: project.name },
                    { projects: { contains: `"${project.name}"` } },
                ],
            },
        });

        const assignedInterns = await db.intern.findMany({
            where: {
                OR: [
                    { project: project.name },
                    { projects: { contains: `"${project.name}"` } },
                ],
            },
        });

        // Start transaction for cascading deletion
        await db.$transaction(async (tx) => {
            // 1. Delete all task submissions related to project tasks
            await tx.taskSubmission.deleteMany({
                where: {
                    task: {
                        projectId: id,
                    },
                },
            });

            // 2. Delete all task assignments related to project tasks
            await tx.taskAssignment.deleteMany({
                where: {
                    task: {
                        projectId: id,
                    },
                },
            });

            // 3. Delete all tasks in the project
            await tx.task.deleteMany({
                where: { projectId: id },
            });

            // 4. Delete all daily logs for the project
            await tx.projectDailyLog.deleteMany({
                where: { projectId: id },
            });

            // 5. Delete all project documents
            await tx.projectDocument.deleteMany({
                where: { projectId: id },
            });

            // 6. Update employees - remove project assignments
            for (const employee of assignedEmployees) {
                let updatedProjects: string[] = [];
                
                // Handle projects JSON array
                if (employee.projects) {
                    try {
                        const currentProjects = JSON.parse(employee.projects);
                        updatedProjects = currentProjects.filter((p: string) => p !== project.name);
                    } catch {
                        // If parsing fails, treat as single project
                        updatedProjects = employee.project === project.name ? [] : [employee.project];
                    }
                } else if (employee.project && employee.project !== project.name) {
                    updatedProjects = [employee.project];
                }

                // Update employee
                await tx.employee.update({
                    where: { id: employee.id },
                    data: {
                        project: employee.project === project.name ? 'Unassigned' : employee.project,
                        projects: updatedProjects.length > 0 ? JSON.stringify(updatedProjects) : null,
                    },
                });
            }

            // 7. Update interns - remove project assignments
            for (const intern of assignedInterns) {
                let updatedProjects: string[] = [];
                
                // Handle projects JSON array
                if (intern.projects) {
                    try {
                        const currentProjects = JSON.parse(intern.projects);
                        updatedProjects = currentProjects.filter((p: string) => p !== project.name);
                    } catch {
                        // If parsing fails, treat as single project
                        updatedProjects = intern.project === project.name ? [] : [intern.project];
                    }
                } else if (intern.project && intern.project !== project.name) {
                    updatedProjects = [intern.project];
                }

                // Update intern
                await tx.intern.update({
                    where: { id: intern.id },
                    data: {
                        project: intern.project === project.name ? 'Unassigned' : intern.project,
                        projects: updatedProjects.length > 0 ? JSON.stringify(updatedProjects) : null,
                    },
                });
            }

            // 8. Finally, delete the project itself
            await tx.project.delete({
                where: { id },
            });
        });

        // Send notifications to affected users
        try {
            // Notify employees
            for (const employee of assignedEmployees) {
                if (employee.user?.id) {
                    await createNotification({
                        userId: employee.user.id,
                        type: 'project',
                        priority: 'high',
                        title: 'Project Deleted',
                        message: `Project "${project.name}" has been deleted. You have been unassigned from this project.`,
                        actionUrl: '/employee-dashboard/my-projects',
                        actionLabel: 'View Projects',
                    });
                }
            }

            // Notify interns
            for (const intern of assignedInterns) {
                if (intern.user?.id) {
                    await createNotification({
                        userId: intern.user.id,
                        type: 'project',
                        priority: 'high',
                        title: 'Project Deleted',
                        message: `Project "${project.name}" has been deleted. You have been unassigned from this project.`,
                        actionUrl: '/intern-dashboard/my-projects',
                        actionLabel: 'View Projects',
                    });
                }
            }
        } catch (notificationError) {
            console.error('Error sending notifications:', notificationError);
            // Don't fail the deletion if notifications fail
        }

        return NextResponse.json({
            message: 'Project deleted successfully',
            deletedProject: {
                id: project.id,
                name: project.name,
                tasksDeleted: project.tasks.length,
                dailyLogsDeleted: project.dailyLogs.length,
                affectedEmployees: assignedEmployees.length,
                affectedInterns: assignedInterns.length,
            },
        });
    } catch (error: any) {
        console.error('Error deleting project:', error);
        
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(
            { error: 'Failed to delete project' },
            { status: 500 }
        );
    }
}