import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH /api/notifications/[id]/read - Mark notification as read
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const notification = await db.notification.update({
            where: { id },
            data: { read: true },
        });

        return NextResponse.json(notification);
    } catch (error: any) {
        console.error('Error marking notification as read:', error);
        
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Notification not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(
            { error: 'Failed to mark notification as read' },
            { status: 500 }
        );
    }
}