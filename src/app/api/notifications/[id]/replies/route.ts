import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/notifications/[id]/replies - Get replies for a notification
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const replies = await db.notificationReply.findMany({
            where: { notificationId: params.id },
            orderBy: { createdAt: 'asc' }
        });

        return NextResponse.json({ replies });
    } catch (error) {
        console.error('Error fetching replies:', error);
        return NextResponse.json(
            { error: 'Failed to fetch replies' },
            { status: 500 }
        );
    }
}

// POST /api/notifications/[id]/replies - Add a reply to a notification
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId, userName, userRole, message } = await request.json();

        if (!userId || !userName || !userRole || !message?.trim()) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const reply = await db.notificationReply.create({
            data: {
                notificationId: params.id,
                userId,
                userName,
                userRole,
                message: message.trim()
            }
        });

        return NextResponse.json(reply);
    } catch (error) {
        console.error('Error creating reply:', error);
        return NextResponse.json(
            { error: 'Failed to create reply' },
            { status: 500 }
        );
    }
}

// DELETE /api/notifications/[id]/replies - Delete a reply
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const replyId = searchParams.get('replyId');
        const userId = searchParams.get('userId');

        if (!replyId || !userId) {
            return NextResponse.json(
                { error: 'Missing replyId or userId' },
                { status: 400 }
            );
        }

        // Verify the reply belongs to the user
        const reply = await db.notificationReply.findFirst({
            where: {
                id: replyId,
                notificationId: params.id,
                userId
            }
        });

        if (!reply) {
            return NextResponse.json(
                { error: 'Reply not found or unauthorized' },
                { status: 404 }
            );
        }

        await db.notificationReply.delete({
            where: { id: replyId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting reply:', error);
        return NextResponse.json(
            { error: 'Failed to delete reply' },
            { status: 500 }
        );
    }
}