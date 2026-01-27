import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createNotification, NotificationTemplates } from '@/lib/notification-utils';

// PATCH /api/tasks/[id]/rate - Rate a completed task
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { rating, feedback } = body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        // Get the task to verify it exists and is completed
        const task = await db.task.findUnique({
            where: { id },
            include: {
                intern: true,
                assignee: true,
                project: true,
            },
        });

        if (!task) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        if (task.status !== 'Done') {
            return NextResponse.json(
                { error: 'Task must be completed before rating' },
                { status: 400 }
            );
        }

        // Update task with rating and feedback
        const updateData: any = {
            updatedAt: new Date(),
        };

        // Only add rating fields if they are provided
        if (rating !== undefined) updateData.rating = rating;
        if (feedback !== undefined) updateData.feedback = feedback || null;
        if (body.ratedBy) updateData.ratedBy = body.ratedBy;
        if (rating !== undefined) updateData.ratedAt = new Date();

        const updatedTask = await db.task.update({
            where: { id },
            data: updateData,
            include: {
                intern: true,
                assignee: true,
                project: true,
            },
        });

        // Create notification for the intern/employee about the rating
        if (task.internId && task.intern) {
            await createNotification({
                type: 'task_rated',
                priority: 'medium',
                title: 'Task Rated',
                message: `Your task "${task.title}" has been rated ${rating}/5 stars`,
                userId: task.intern.id,
                actionUrl: '/intern-dashboard/tasks',
                actionLabel: 'View Tasks',
                metadata: JSON.stringify({
                    taskId: task.id,
                    rating: rating,
                    feedback: feedback,
                }),
            });
        } else if (task.assigneeId && task.assignee) {
            await createNotification({
                type: 'task_rated',
                priority: 'medium',
                title: 'Task Rated',
                message: `Your task "${task.title}" has been rated ${rating}/5 stars`,
                userId: task.assignee.id,
                actionUrl: '/employee-dashboard/tasks',
                actionLabel: 'View Tasks',
                metadata: JSON.stringify({
                    taskId: task.id,
                    rating: rating,
                    feedback: feedback,
                }),
            });
        }

        return NextResponse.json(updatedTask);
    } catch (error) {
        console.error('Error rating task:', error);
        return NextResponse.json(
            { error: 'Failed to rate task' },
            { status: 500 }
        );
    }
}