import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/messages/bulk/[id]/stats - Get detailed stats for a bulk message
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const bulkMessage = await db.bulkMessage.findUnique({
            where: { id },
            include: {
                notifications: {
                    include: {
                        reactions: true,
                        replies: true
                    }
                }
            }
        });

        if (!bulkMessage) {
            return NextResponse.json(
                { error: 'Bulk message not found' },
                { status: 404 }
            );
        }

        console.log('Total notifications found:', bulkMessage.notifications.length); // Debug log
        console.log('Sample notification userIds:', bulkMessage.notifications.slice(0, 3).map(n => n.userId)); // Debug log

        // Calculate statistics
        const totalRecipients = bulkMessage.notifications.length;
        const readCount = bulkMessage.notifications.filter(n => n.read).length;
        const unreadCount = totalRecipients - readCount;
        const reactionCount = bulkMessage.notifications.reduce(
            (sum, n) => sum + n.reactions.length, 
            0
        );
        const replyCount = bulkMessage.notifications.reduce(
            (sum, n) => sum + n.replies.length, 
            0
        );

        // Get users who read (with names) - try multiple approaches
        const readByWithNames = await Promise.all(
            bulkMessage.notifications
                .filter(n => n.read)
                .map(async (n) => {
                    try {
                        // First try to get user from users table
                        let user = await db.user.findUnique({
                            where: { id: n.userId },
                            select: { name: true, email: true, role: true, employeeId: true, internId: true }
                        });
                        
                        let userName = user?.name || user?.email;
                        
                        // If no name found, try to get from employee table
                        if (!userName && user?.employeeId) {
                            const employee = await db.employee.findUnique({
                                where: { id: user.employeeId },
                                select: { name: true, email: true }
                            });
                            userName = employee?.name || employee?.email;
                        }
                        
                        // If still no name, try to get from intern table
                        if (!userName && user?.internId) {
                            const intern = await db.intern.findUnique({
                                where: { id: user.internId },
                                select: { name: true, email: true }
                            });
                            userName = intern?.name || intern?.email;
                        }
                        
                        console.log(`User lookup for ${n.userId}:`, { user, userName }); // Debug log
                        
                        return {
                            userId: n.userId,
                            userName: userName || `User ${n.userId.slice(-8)}`,
                            readAt: n.updatedAt
                        };
                    } catch (error) {
                        console.error(`Error looking up user ${n.userId}:`, error);
                        return {
                            userId: n.userId,
                            userName: `User ${n.userId.slice(-8)}`,
                            readAt: n.updatedAt
                        };
                    }
                })
        );

        // Get users who haven't read (with names) - try multiple approaches
        const unreadByWithNames = await Promise.all(
            bulkMessage.notifications
                .filter(n => !n.read)
                .map(async (n) => {
                    try {
                        // First try to get user from users table
                        let user = await db.user.findUnique({
                            where: { id: n.userId },
                            select: { name: true, email: true, role: true, employeeId: true, internId: true }
                        });
                        
                        let userName = user?.name || user?.email;
                        
                        // If no name found, try to get from employee table
                        if (!userName && user?.employeeId) {
                            const employee = await db.employee.findUnique({
                                where: { id: user.employeeId },
                                select: { name: true, email: true }
                            });
                            userName = employee?.name || employee?.email;
                        }
                        
                        // If still no name, try to get from intern table
                        if (!userName && user?.internId) {
                            const intern = await db.intern.findUnique({
                                where: { id: user.internId },
                                select: { name: true, email: true }
                            });
                            userName = intern?.name || intern?.email;
                        }
                        
                        console.log(`User lookup for ${n.userId}:`, { user, userName }); // Debug log
                        
                        return {
                            userId: n.userId,
                            userName: userName || `User ${n.userId.slice(-8)}`,
                            sentAt: n.createdAt
                        };
                    } catch (error) {
                        console.error(`Error looking up user ${n.userId}:`, error);
                        return {
                            userId: n.userId,
                            userName: `User ${n.userId.slice(-8)}`,
                            sentAt: n.createdAt
                        };
                    }
                })
        );

        // Get all reactions grouped
        const allReactions: Record<string, any[]> = {};
        bulkMessage.notifications.forEach(notification => {
            notification.reactions.forEach(reaction => {
                if (!allReactions[reaction.reaction]) {
                    allReactions[reaction.reaction] = [];
                }
                allReactions[reaction.reaction].push({
                    userId: reaction.userId,
                    userName: reaction.userName,
                    notificationId: notification.id,
                    createdAt: reaction.createdAt
                });
            });
        });

        // Get all replies
        const allReplies = bulkMessage.notifications.flatMap(notification =>
            notification.replies.map(reply => ({
                id: reply.id,
                userId: reply.userId,
                userName: reply.userName,
                userRole: reply.userRole,
                message: reply.message,
                notificationId: notification.id,
                createdAt: reply.createdAt
            }))
        ).sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        // Get users who replied
        const repliedBy = [...new Set(allReplies.map(r => r.userId))].map(userId => {
            const userReplies = allReplies.filter(r => r.userId === userId);
            return {
                userId,
                userName: userReplies[0].userName,
                replyCount: userReplies.length,
                lastReply: userReplies[userReplies.length - 1].createdAt
            };
        });

        return NextResponse.json({
            bulkMessage: {
                id: bulkMessage.id,
                title: bulkMessage.title,
                message: bulkMessage.message,
                type: bulkMessage.type,
                priority: bulkMessage.priority,
                sentAt: bulkMessage.sentAt,
                createdAt: bulkMessage.createdAt
            },
            stats: {
                totalRecipients,
                readCount,
                unreadCount,
                readPercentage: totalRecipients > 0 
                    ? Math.round((readCount / totalRecipients) * 100) 
                    : 0,
                reactionCount,
                replyCount,
                engagementRate: totalRecipients > 0
                    ? Math.round(((readCount + reactionCount + replyCount) / totalRecipients) * 100)
                    : 0
            },
            readBy: readByWithNames,
            unreadBy: unreadByWithNames,
            reactions: allReactions,
            replies: allReplies,
            repliedBy
        });
    } catch (error) {
        console.error('Error fetching bulk message stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bulk message stats' },
            { status: 500 }
        );
    }
}