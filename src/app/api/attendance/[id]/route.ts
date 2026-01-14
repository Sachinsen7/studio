import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT - Update attendance record
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, checkIn, checkOut } = body;

        const attendance = await db.attendance.update({
            where: { id },
            data: { status, checkIn, checkOut },
        });

        return NextResponse.json(attendance);
    } catch (error) {
        console.error('Error updating attendance:', error);
        return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
    }
}

// DELETE - Remove attendance record
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await db.attendance.delete({ where: { id } });
        return NextResponse.json({ message: 'Attendance record deleted' });
    } catch (error) {
        console.error('Error deleting attendance:', error);
        return NextResponse.json({ error: 'Failed to delete attendance' }, { status: 500 });
    }
}
