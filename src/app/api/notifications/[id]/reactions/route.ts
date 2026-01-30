import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/notifications/[id]/reactions - Get reactions for a notification
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const reactions = await db.notificationReaction.findMany({
            where: { notificationId: params.id },
            orderBy: { createdAt: 'desc' }
        });

        // Group reactions by emoji
        const groupedReactions: Record<string, any[]> = {};
        reactions.forEach(reaction => {
            if (!groupedReactions[reaction.reaction]) {
                groupedReactions[reaction.reaction] = [];
            }
            groupedReactions[reaction.reaction].push({
                userId: reaction.userId,
                userName: reaction.userName,
                createdAt: reaction.createdAt
            });
        });

        return NextResponse.json({ reactions: groupedReactions });
    } catch (error) {
        console.error('Error fetching reactions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reactions' },
            { status: 500 }
        );
    }
}

// POST /api/notifications/[id]/reactions - Add or toggle a reaction
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId, userName, reaction } = await request.json();

        if (!userId || !userName || !reaction) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if user already reacted with this emoji
        const existingReaction = await db.notificationReaction.findUnique({
            where: {
                notificationId_userId_reaction: {
                    notificationId: params.id,
                    userId,
                    reaction
                }
            }
        });

        if (existingReaction) {
            // Remove the reaction (toggle off)
            await db.notificationReaction.delete({
                where: { id: existingReaction.id }
            });
            return NextResponse.json({ action: 'removed' });
        } else {
            // Add the reaction
            const newReaction = await db.notificationReaction.create({
                data: {
                    notificationId: params.id,
                    userId,
                    userName,
                    reaction
                }
            });
            return NextResponse.json({ action: 'added', reaction: newReaction });
        }
    } catch (error) {
        console.error('Error toggling reaction:', error);
        return NextResponse.json(
            { error: 'Failed to toggle reaction' },
            { status: 500 }
        );
    }
}