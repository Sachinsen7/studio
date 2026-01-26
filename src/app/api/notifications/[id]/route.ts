import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE /api/notifications/[id] - Delete a notification
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await db.notification.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Notification deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting notification:', error);
        
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Notification not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(
            { error: 'Failed to delete notification' },
            { status: 500 }
        );
    }
}