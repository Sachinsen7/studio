'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Send, ThumbsUp, Heart, Smile, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Reaction {
  userId: string;
  userName: string;
  createdAt: string;
}

interface Reply {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  message: string;
  createdAt: string;
}

interface NotificationReplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notification: {
    id: string;
    title: string;
    message: string;
    type: string;
    priority: string;
    timestamp: Date;
  };
}

const REACTION_EMOJIS = [
  { emoji: '👍', label: 'Like', icon: ThumbsUp },
  { emoji: '❤️', label: 'Love', icon: Heart },
  { emoji: '😊', label: 'Happy', icon: Smile },
  { emoji: '✅', label: 'Done', icon: CheckCircle },
  { emoji: '⚠️', label: 'Important', icon: AlertCircle },
];

export function NotificationReplyDialog({ 
  open, 
  onOpenChange, 
  notification 
}: NotificationReplyDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [replyMessage, setReplyMessage] = React.useState('');
  const [replies, setReplies] = React.useState<Reply[]>([]);
  const [reactions, setReactions] = React.useState<Record<string, Reaction[]>>({});
  const [loading, setLoading] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Fetch replies and reactions when dialog opens
  React.useEffect(() => {
    if (open) {
      fetchReplies();
      fetchReactions();
    }
  }, [open, notification.id]);

  // Auto-scroll to bottom when new replies arrive
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [replies]);

  const fetchReplies = async () => {
    try {
      const response = await fetch(`/api/notifications/${notification.id}/replies`);
      if (response.ok) {
        const data = await response.json();
        setReplies(data.replies || []);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const fetchReactions = async () => {
    try {
      const response = await fetch(`/api/notifications/${notification.id}/reactions`);
      if (response.ok) {
        const data = await response.json();
        setReactions(data.reactions || {});
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  const handleReaction = async (emoji: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/notifications/${notification.id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          reaction: emoji
        })
      });

      if (response.ok) {
        await fetchReactions();
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to add reaction',
        variant: 'destructive'
      });
    }
  };

  const handleSendReply = async () => {
    if (!user || !replyMessage.trim()) return;

    setSending(true);
    try {
      const response = await fetch(`/api/notifications/${notification.id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          message: replyMessage.trim()
        })
      });

      if (response.ok) {
        const newReply = await response.json();
        setReplies(prev => [...prev, newReply]);
        setReplyMessage('');
        toast({
          title: 'Reply sent',
          description: 'Your reply has been posted'
        });
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!user) return;

    try {
      const response = await fetch(
        `/api/notifications/${notification.id}/replies?replyId=${replyId}&userId=${user.id}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setReplies(prev => prev.filter(r => r.id !== replyId));
        toast({
          title: 'Reply deleted',
          description: 'Your reply has been removed'
        });
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete reply',
        variant: 'destructive'
      });
    }
  };

  const hasUserReacted = (emoji: string) => {
    if (!user || !reactions[emoji]) return false;
    return reactions[emoji].some(r => r.userId === user.id);
  };

  const getReactionCount = (emoji: string) => {
    return reactions[emoji]?.length || 0;
  };

  const getTotalReactions = () => {
    return Object.values(reactions).reduce((sum, users) => sum + users.length, 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{notification.title}</DialogTitle>
          <DialogDescription className="text-sm">
            {notification.message}
          </DialogDescription>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs capitalize">
              {notification.type}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {notification.priority}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {format(notification.timestamp, 'PPp')}
            </span>
          </div>
        </DialogHeader>

        {/* Reactions */}
        <div className="flex flex-wrap gap-2 py-3 border-y">
          {REACTION_EMOJIS.map(({ emoji, label }) => {
            const count = getReactionCount(emoji);
            const isActive = hasUserReacted(emoji);
            
            return (
              <Button
                key={emoji}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleReaction(emoji)}
                className="h-8 px-3"
              >
                <span className="mr-1">{emoji}</span>
                {count > 0 && <span className="text-xs">{count}</span>}
              </Button>
            );
          })}
          {getTotalReactions() > 0 && (
            <span className="text-xs text-muted-foreground self-center ml-2">
              {getTotalReactions()} reaction{getTotalReactions() !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Replies */}
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {replies.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                No replies yet. Be the first to reply!
              </div>
            ) : (
              replies.map((reply) => (
                <div key={reply.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    {reply.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{reply.userName}</span>
                      <Badge variant="secondary" className="text-xs">
                        {reply.userRole}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(reply.createdAt), 'PPp')}
                      </span>
                      {user?.id === reply.userId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-auto"
                          onClick={() => handleDeleteReply(reply.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-foreground">{reply.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Reply Input */}
        <div className="space-y-2 pt-4 border-t">
          <Textarea
            placeholder="Type your reply..."
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            rows={3}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                handleSendReply();
              }
            }}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Press Ctrl+Enter to send
            </span>
            <Button 
              onClick={handleSendReply} 
              disabled={!replyMessage.trim() || sending}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Sending...' : 'Send Reply'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}