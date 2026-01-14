import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH - Update leave request status
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, adminComment } = body;

        if (!status || !['Approved', 'Rejected', 'Pending'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const leaveRequest = await db.leaveRequest.update({
            where: { id },
            data: { 
                status,
                ...(adminComment && { adminComment }),
            },
            include: { employee: true },
        });

        return NextResponse.json(leaveRequest);
    } catch (error) {
        console.error('Error updating leave request:', error);
        return NextResponse.json({ error: 'Failed to update leave request' }, { status: 500 });
    }
}
