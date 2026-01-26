import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createNotification } from '@/lib/notification-utils';

// POST /api/projects/bulk-delete - Delete multiple projects
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { projectIds } = body;

        if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
            return NextResponse.json(
                { error: 'Project IDs array is required' },
                { status: 400 }
            );
        }

        // Get all projects to be deleted for notifications
        const projects = await db.project.findMany({
            where: {
                id: { in: projectIds },
            },
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

        if (projects.length === 0) {
            return NextResponse.json(
                { error: 'No projects found with the provided IDs' },
                { status: 404 }
            );
        }

        // Get all affected employees and interns
        const allAffectedEmployees = new Map();
        const allAffectedInterns = new Map();
        const projectNames = projects.map(p => p.name);

        for (const projectName of projectNames) {
            // Get employees assigned to this project
            const employees = await db.employee.findMany({
                where: {
                    OR: [
                        { project: projectName },
                        { projects: { contains: `"${projectName}"` } },
                    ],
                },
            });

            // Get interns assigned to this project
            const interns = await db.intern.findMany({
                where: {
                    OR: [
                        { project: projectName },
                        { projects: { contains: `"${projectName}"` } },
                    ],
                },
            });

            employees.forEach(emp => allAffectedEmployees.set(emp.id, emp));
            interns.forEach(intern => allAffectedInterns.set(intern.id, intern));
        }

        let deletionResults = [];

        // Process each project deletion in a transaction
        for (const project of projects) {
            try {
                await db.$transaction(async (tx) => {
                    // 1. Delete task submissions
                    await tx.taskSubmission.deleteMany({
                        where: {
                            task: {
                                projectId: project.id,
                            },
                        },
                    });

                    // 2. Delete task assignments
                    await tx.taskAssignment.deleteMany({
                        where: {
                            task: {
                                projectId: project.id,
                            },
                        },
                    });

                    // 3. Delete tasks
                    await tx.task.deleteMany({
                        where: { projectId: project.id },
                    });

                    // 4. Delete daily logs
                    await tx.projectDailyLog.deleteMany({
                        where: { projectId: project.id },
                    });

                    // 5. Delete documents
                    await tx.projectDocument.deleteMany({
                        where: { projectId: project.id },
                    });

                    // 6. Delete the project
                    await tx.project.delete({
                        where: { id: project.id },
                    });
                });

                deletionResults.push({
                    id: project.id,
                    name: project.name,
                    status: 'success',
                    tasksDeleted: project.tasks.length,
                    dailyLogsDeleted: project.dailyLogs.length,
                });
            } catch (error) {
                console.error(`Error deleting project ${project.name}:`, error);
                deletionResults.push({
                    id: project.id,
                    name: project.name,
                    status: 'failed',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        // Update employee assignments (remove deleted projects)
        for (const employee of allAffectedEmployees.values()) {
            try {
                let updatedProjects: string[] = [];
                
                if (employee.projects) {
                    try {
                        const currentProjects = JSON.parse(employee.projects);
                        updatedProjects = currentProjects.filter((p: string) => !projectNames.includes(p));
                    } catch {
                        updatedProjects = projectNames.includes(employee.project) ? [] : [employee.project];
                    }
                } else if (employee.project && !projectNames.includes(employee.project)) {
                    updatedProjects = [employee.project];
                }

                await db.employee.update({
                    where: { id: employee.id },
                    data: {
                        project: projectNames.includes(employee.project) ? 'Unassigned' : employee.project,
                        projects: updatedProjects.length > 0 ? JSON.stringify(updatedProjects) : null,
                    },
                });
            } catch (error) {
                console.error(`Error updating employee ${employee.id}:`, error);
            }
        }

        // Update intern assignments (remove deleted projects)
        for (const intern of allAffectedInterns.values()) {
            try {
                let updatedProjects: string[] = [];
                
                if (intern.projects) {
                    try {
                        const currentProjects = JSON.parse(intern.projects);
                        updatedProjects = currentProjects.filter((p: string) => !projectNames.includes(p));
                    } catch {
                        updatedProjects = projectNames.includes(intern.project) ? [] : [intern.project];
                    }
                } else if (intern.project && !projectNames.includes(intern.project)) {
                    updatedProjects = [intern.project];
                }

                await db.intern.update({
                    where: { id: intern.id },
                    data: {
                        project: projectNames.includes(intern.project) ? 'Unassigned' : intern.project,
                        projects: updatedProjects.length > 0 ? JSON.stringify(updatedProjects) : null,
                    },
                });
            } catch (error) {
                console.error(`Error updating intern ${intern.id}:`, error);
            }
        }

        // Send notifications to affected users
        try {
            const successfulDeletions = deletionResults.filter(r => r.status === 'success');
            const deletedProjectNames = successfulDeletions.map(r => r.name);

            if (deletedProjectNames.length > 0) {
                // Notify employees
                for (const employee of allAffectedEmployees.values()) {
                    if (employee.user?.id) {
                        await createNotification({
                            userId: employee.user.id,
                            type: 'project',
                            priority: 'high',
                            title: 'Projects Deleted',
                            message: `${deletedProjectNames.length} project(s) have been deleted: ${deletedProjectNames.join(', ')}. You have been unassigned from these projects.`,
                            actionUrl: '/employee-dashboard/my-projects',
                            actionLabel: 'View Projects',
                        });
                    }
                }

                // Notify interns
                for (const intern of allAffectedInterns.values()) {
                    if (intern.user?.id) {
                        await createNotification({
                            userId: intern.user.id,
                            type: 'project',
                            priority: 'high',
                            title: 'Projects Deleted',
                            message: `${deletedProjectNames.length} project(s) have been deleted: ${deletedProjectNames.join(', ')}. You have been unassigned from these projects.`,
                            actionUrl: '/intern-dashboard/my-projects',
                            actionLabel: 'View Projects',
                        });
                    }
                }
            }
        } catch (notificationError) {
            console.error('Error sending bulk notifications:', notificationError);
        }

        const successCount = deletionResults.filter(r => r.status === 'success').length;
        const failureCount = deletionResults.filter(r => r.status === 'failed').length;

        return NextResponse.json({
            message: `Bulk deletion completed. ${successCount} projects deleted successfully, ${failureCount} failed.`,
            results: deletionResults,
            summary: {
                totalRequested: projectIds.length,
                successful: successCount,
                failed: failureCount,
                affectedEmployees: allAffectedEmployees.size,
                affectedInterns: allAffectedInterns.size,
            },
        });
    } catch (error) {
        console.error('Error in bulk project deletion:', error);
        return NextResponse.json(
            { error: 'Failed to delete projects' },
            { status: 500 }
        );
    }
}