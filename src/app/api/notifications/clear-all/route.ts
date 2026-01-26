import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE /api/notifications/clear-all - Clear all notifications for a user
export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        await db.notification.deleteMany({
            where: { userId },
        });

        return NextResponse.json({ message: 'All notifications cleared' });
    } catch (error) {
        console.error('Error clearing all notifications:', error);
        return NextResponse.json(
            { error: 'Failed to clear all notifications' },
            { status: 500 }
        );
    }
}