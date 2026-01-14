import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH - Update leave request (approve/reject)
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { status, adminComment } = body;

        if (!status || !['Approved', 'Rejected', 'Pending'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const leaveRequest = await db.leaveRequest.update({
            where: { id: params.id },
            data: {
                status,
                adminComment,
                updatedAt: new Date(),
            },
            include: { employee: true },
        });

        return NextResponse.json(leaveRequest);
    } catch (error) {
        console.error('Error updating leave request:', error);
        return NextResponse.json({ error: 'Failed to update leave request' }, { status: 500 });
    }
}

// DELETE - Delete leave request
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await db.leaveRequest.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: 'Leave request deleted' });
    } catch (error) {
        console.error('Error deleting leave request:', error);
        return NextResponse.json({ error: 'Failed to delete leave request' }, { status: 500 });
    }
}
