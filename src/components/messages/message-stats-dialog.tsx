'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, MessageSquare, ThumbsUp, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface MessageStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageId: string;
}

export function MessageStatsDialog({ open, onOpenChange, messageId }: MessageStatsDialogProps) {
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open && messageId) {
      fetchStats();
    }
  }, [open, messageId]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/messages/bulk/${messageId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!stats) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Loading Statistics...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{stats.bulkMessage.title}</DialogTitle>
          <DialogDescription>
            Sent on {format(new Date(stats.bulkMessage.sentAt || stats.bulkMessage.createdAt), 'PPp')}
          </DialogDescription>
        </DialogHeader>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stats.totalRecipients}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Read
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stats.readCount}</div>
              <p className="text-xs text-muted-foreground">{stats.stats.readPercentage}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ThumbsUp className="h-4 w-4 text-blue-500" />
                Reactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stats.reactionCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-500" />
                Replies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stats.replyCount}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="read" className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="read">
              Read ({stats.stats.readCount})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({stats.stats.unreadCount})
            </TabsTrigger>
            <TabsTrigger value="reactions">
              Reactions ({stats.stats.reactionCount})
            </TabsTrigger>
            <TabsTrigger value="replies">
              Replies ({stats.stats.replyCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="read">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {stats.readBy.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No one has read this message yet</p>
                ) : (
                  stats.readBy.map((user: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{user.userName || `User ${user.userId?.slice(-8) || 'Unknown'}`}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(user.readAt), 'PPp')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="unread">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {stats.unreadBy.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Everyone has read this message!</p>
                ) : (
                  stats.unreadBy.map((user: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{user.userName || `User ${user.userId?.slice(-8) || 'Unknown'}`}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Sent {format(new Date(user.sentAt), 'PPp')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="reactions">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {Object.keys(stats.reactions).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No reactions yet</p>
                ) : (
                  Object.entries(stats.reactions).map(([emoji, users]: [string, any]) => (
                    <div key={emoji} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{emoji}</span>
                        <span className="text-sm font-medium">{users.length} reaction{users.length !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="pl-10 space-y-1">
                        {users.map((user: any, index: number) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>{user.userName}</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(user.createdAt), 'PPp')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="replies">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {stats.replies.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No replies yet</p>
                ) : (
                  stats.replies.map((reply: any) => (
                    <div key={reply.id} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{reply.userName}</span>
                          <Badge variant="secondary" className="text-xs">{reply.userRole}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(reply.createdAt), 'PPp')}
                        </span>
                      </div>
                      <p className="text-sm">{reply.message}</p>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Engagement Summary */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="font-medium">Engagement Rate</span>
          </div>
          <span className="text-2xl font-bold">{stats.stats.engagementRate}%</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}