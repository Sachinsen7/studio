import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createNotification } from '@/lib/notification-utils';

// POST /api/projects/[id]/archive - Archive a project (soft delete)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { reason } = body;

        // Check if project exists
        const project = await db.project.findUnique({
            where: { id },
            include: {
                tasks: {
                    include: {
                        assignee: true,
                        intern: true,
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

        // Update project status to archived
        const archivedProject = await db.project.update({
            where: { id },
            data: {
                status: 'Completed', // or create an 'Archived' status in the enum
                description: project.description 
                    ? `${project.description}\n\n[ARCHIVED: ${reason || 'No reason provided'}]`
                    : `[ARCHIVED: ${reason || 'No reason provided'}]`,
            },
        });

        // Get affected employees and interns
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

        // Send notifications to affected users
        try {
            // Notify employees
            for (const employee of assignedEmployees) {
                if (employee.user?.id) {
                    await createNotification({
                        userId: employee.user.id,
                        type: 'project',
                        priority: 'medium',
                        title: 'Project Archived',
                        message: `Project "${project.name}" has been archived. ${reason ? `Reason: ${reason}` : ''}`,
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
                        priority: 'medium',
                        title: 'Project Archived',
                        message: `Project "${project.name}" has been archived. ${reason ? `Reason: ${reason}` : ''}`,
                        actionUrl: '/intern-dashboard/my-projects',
                        actionLabel: 'View Projects',
                    });
                }
            }
        } catch (notificationError) {
            console.error('Error sending archive notifications:', notificationError);
        }

        return NextResponse.json({
            message: 'Project archived successfully',
            archivedProject: {
                id: archivedProject.id,
                name: archivedProject.name,
                status: archivedProject.status,
                reason: reason || 'No reason provided',
                affectedEmployees: assignedEmployees.length,
                affectedInterns: assignedInterns.length,
            },
        });
    } catch (error: any) {
        console.error('Error archiving project:', error);
        
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(
            { error: 'Failed to archive project' },
            { status: 500 }
        );
    }
}

// DELETE /api/projects/[id]/archive - Unarchive a project
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check if project exists
        const project = await db.project.findUnique({
            where: { id },
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Remove archive information from description
        let cleanDescription = project.description || '';
        const archiveRegex = /\n\n\[ARCHIVED:.*?\]$/;
        cleanDescription = cleanDescription.replace(archiveRegex, '');

        // Update project status back to active
        const unarchivedProject = await db.project.update({
            where: { id },
            data: {
                status: 'OnTrack',
                description: cleanDescription || null,
            },
        });

        // Get affected employees and interns
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

        // Send notifications to affected users
        try {
            // Notify employees
            for (const employee of assignedEmployees) {
                if (employee.user?.id) {
                    await createNotification({
                        userId: employee.user.id,
                        type: 'project',
                        priority: 'medium',
                        title: 'Project Reactivated',
                        message: `Project "${project.name}" has been reactivated and is now active again.`,
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
                        priority: 'medium',
                        title: 'Project Reactivated',
                        message: `Project "${project.name}" has been reactivated and is now active again.`,
                        actionUrl: '/intern-dashboard/my-projects',
                        actionLabel: 'View Projects',
                    });
                }
            }
        } catch (notificationError) {
            console.error('Error sending reactivation notifications:', notificationError);
        }

        return NextResponse.json({
            message: 'Project reactivated successfully',
            project: {
                id: unarchivedProject.id,
                name: unarchivedProject.name,
                status: unarchivedProject.status,
                affectedEmployees: assignedEmployees.length,
                affectedInterns: assignedInterns.length,
            },
        });
    } catch (error: any) {
        console.error('Error reactivating project:', error);
        
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(
            { error: 'Failed to reactivate project' },
            { status: 500 }
        );
    }
}