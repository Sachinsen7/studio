import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH - Update task approval status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { approvalStatus } = body;

        if (!approvalStatus || !['Approved', 'Rejected', 'Pending'].includes(approvalStatus)) {
            return NextResponse.json({ error: 'Invalid approval status' }, { status: 400 });
        }

        const task = await db.task.update({
            where: { id },
            data: { approvalStatus },
            include: {
                assignee: true,
                project: true,
            },
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error('Error updating task approval:', error);
        return NextResponse.json({ error: 'Failed to update task approval' }, { status: 500 });
    }
}
