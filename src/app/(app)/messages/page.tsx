'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Send, Users, Clock, CheckCircle, XCircle, BarChart3, MessageSquare } from 'lucide-react';
import { BulkMessageComposer } from '@/components/messages/bulk-message-composer';
import { MessageHistory } from '@/components/messages/message-history';
import { MessageStatsDialog } from '@/components/messages/message-stats-dialog';
import { useToast } from '@/hooks/use-toast';

interface BulkMessage {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  recipientType: string;
  totalRecipients: number;
  deliveredCount: number;
  readCount: number;
  replyCount?: number;
  status: string;
  sentAt: string | null;
  createdAt: string;
}

export default function MessagesPage() {
  const [bulkMessages, setBulkMessages] = useState<BulkMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [statsMessageId, setStatsMessageId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchBulkMessages();
  }, []);

  const fetchBulkMessages = async () => {
    try {
      const response = await fetch('/api/messages/bulk');
      if (response.ok) {
        const data = await response.json();
        setBulkMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching bulk messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch messages',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMessageSent = (newMessage: BulkMessage) => {
    setBulkMessages(prev => [newMessage, ...prev]);
    setShowComposer(false);
    toast({
      title: 'Message Sent',
      description: `Message sent to ${newMessage.totalRecipients} recipients`,
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'outline',
      scheduled: 'secondary',
      sending: 'default',
      sent: 'default',
      failed: 'destructive'
    };

    const colors: Record<string, string> = {
      draft: 'text-gray-600',
      scheduled: 'text-blue-600',
      sending: 'text-yellow-600',
      sent: 'text-green-600',
      failed: 'text-red-600'
    };

    return (
      <Badge variant={variants[status] || 'outline'} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      low: 'outline',
      medium: 'secondary',
      high: 'default',
      urgent: 'destructive'
    };

    return (
      <Badge variant={variants[priority] || 'outline'}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Bulk Messages</h1>
          <p className="text-gray-600 mt-1">Send announcements and updates to your team</p>
        </div>
        <Button onClick={() => setShowComposer(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Message
        </Button>
      </div>

      {showComposer && (
        <div className="mb-6">
          <BulkMessageComposer
            onMessageSent={handleMessageSent}
            onCancel={() => setShowComposer(false)}
          />
        </div>
      )}

      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recent">Recent Messages</TabsTrigger>
          <TabsTrigger value="history">Message History</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          {bulkMessages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Send className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-600 text-center mb-4">
                  Start by creating your first bulk message to communicate with your team.
                </p>
                <Button onClick={() => setShowComposer(true)}>
                  Create First Message
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {bulkMessages.slice(0, 10).map((message) => (
                <Card key={message.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{message.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {message.message.length > 100 
                            ? `${message.message.substring(0, 100)}...` 
                            : message.message
                          }
                        </CardDescription>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {getStatusBadge(message.status)}
                        {getPriorityBadge(message.priority)}
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setStatsMessageId(message.id);
                              setStatsDialogOpen(true);
                            }}
                            title="View detailed statistics"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          {message.replyCount && message.replyCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {message.replyCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{message.totalRecipients} recipients</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>{message.deliveredCount} delivered</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span>{message.readCount} read</span>
                        </div>
                        {message.replyCount && message.replyCount > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4 text-purple-600" />
                            <span>{message.replyCount} {message.replyCount === 1 ? 'reply' : 'replies'}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          {message.sentAt 
                            ? new Date(message.sentAt).toLocaleDateString()
                            : new Date(message.createdAt).toLocaleDateString()
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <MessageHistory messages={bulkMessages} />
        </TabsContent>
      </Tabs>

      {/* Stats Dialog */}
      <MessageStatsDialog
        open={statsDialogOpen}
        onOpenChange={setStatsDialogOpen}
        messageId={statsMessageId}
      />
    </div>
  );
}