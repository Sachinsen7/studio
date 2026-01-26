import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');
        const limit = parseInt(searchParams.get('limit') || '50');
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const where: any = { userId };
        if (unreadOnly) {
            where.read = false;
        }

        const notifications = await db.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            type,
            priority = 'medium',
            title,
            message,
            userId,
            actionUrl,
            actionLabel,
            metadata,
        } = body;

        if (!type || !title || !message || !userId) {
            return NextResponse.json(
                { error: 'Type, title, message, and userId are required' },
                { status: 400 }
            );
        }

        const notification = await db.notification.create({
            data: {
                type,
                priority,
                title,
                message,
                userId,
                actionUrl,
                actionLabel,
                metadata: metadata ? JSON.stringify(metadata) : null,
                read: false,
            },
        });

        return NextResponse.json(notification, { status: 201 });
    } catch (error) {
        console.error('Error creating notification:', error);
        return NextResponse.json(
            { error: 'Failed to create notification' },
            { status: 500 }
        );
    }
}