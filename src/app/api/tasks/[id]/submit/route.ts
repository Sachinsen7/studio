import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Submit task with selfie
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { employeeId, selfieUrl, notes } = body;

        if (!employeeId) {
            return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
        }

        // Create submission
        const submission = await db.taskSubmission.create({
            data: {
                taskId: id,
                employeeId,
                selfieUrl,
                notes,
            },
            include: {
                task: true,
                employee: true,
            },
        });

        // Update task status to Done
        await db.task.update({
            where: { id },
            data: { status: 'Done' },
        });

        return NextResponse.json(submission, { status: 201 });
    } catch (error) {
        console.error('Error submitting task:', error);
        return NextResponse.json({ error: 'Failed to submit task' }, { status: 500 });
    }
}
