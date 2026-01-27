import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createNotification } from '@/lib/notification-utils';

// GET /api/tasks/[id] - Get a specific task
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const task = await db.task.findUnique({
            where: { id },
            include: {
                assignee: true,
                intern: true,
                project: true,
                submissions: true,
            },
        });

        if (!task) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error fetching task:', error);
        return NextResponse.json(
            { error: 'Failed to fetch task' },
            { status: 500 }
        );
    }
}

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Get the current task to check permissions and status
        const currentTask = await db.task.findUnique({
            where: { id },
            include: {
                assignee: true,
                intern: true,
                project: true,
            },
        });

        if (!currentTask) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        // Update the task
        const updatedTask = await db.task.update({
            where: { id },
            data: {
                ...body,
                updatedAt: new Date(),
            },
            include: {
                assignee: true,
                intern: true,
                project: true,
                submissions: true,
            },
        });

        // Create notification if status changed to Done
        if (body.status === 'Done' && currentTask.status !== 'Done') {
            // Notify mentor/team lead about task completion
            if (currentTask.internId && currentTask.intern?.mentorId) {
                await createNotification({
                    type: 'task_completed',
                    priority: 'medium',
                    title: 'Task Completed',
                    message: `${currentTask.intern.name} has completed the task "${currentTask.title}"`,
                    userId: currentTask.intern.mentorId,
                    actionUrl: '/employee-dashboard/my-interns',
                    actionLabel: 'Review Task',
                    metadata: JSON.stringify({
                        taskId: currentTask.id,
                        internId: currentTask.internId,
                    }),
                });
            }
        }

        return NextResponse.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json(
            { error: 'Failed to update task' },
            { status: 500 }
        );
    }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Check if task exists
        const task = await db.task.findUnique({
            where: { id },
        });

        if (!task) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        // Delete the task (cascade will handle related records)
        await db.task.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json(
            { error: 'Failed to delete task' },
            { status: 500 }
        );
    }
}