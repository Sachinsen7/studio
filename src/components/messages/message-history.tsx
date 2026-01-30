'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Trash2, Users, CheckCircle, Clock, Filter, BarChart3, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MessageStatsDialog } from './message-stats-dialog';

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

interface MessageHistoryProps {
  messages: BulkMessage[];
}

export function MessageHistory({ messages }: MessageHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [statsMessageId, setStatsMessageId] = useState<string>('');
  const { toast } = useToast();

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    const matchesType = typeFilter === 'all' || message.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/bulk/${messageId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Message deleted successfully'
        });
        // Refresh the page or update the messages list
        window.location.reload();
      } else {
        throw new Error('Failed to delete message');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive'
      });
    }
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
      <Badge variant={variants[priority] || 'outline'} size="sm">
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeliveryRate = (message: BulkMessage) => {
    if (message.totalRecipients === 0) return 0;
    return Math.round((message.deliveredCount / message.totalRecipients) * 100);
  };

  const getReadRate = (message: BulkMessage) => {
    if (message.deliveredCount === 0) return 0;
    return Math.round((message.readCount / message.deliveredCount) * 100);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="sending">Sending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="reminder">Reminder</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
          <CardDescription>
            {filteredMessages.length} of {messages.length} messages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMessages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No messages found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Read Rate</TableHead>
                    <TableHead>Replies</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow key={message.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{message.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {message.message}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{getPriorityBadge(message.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{message.totalRecipients}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>{message.deliveredCount}</span>
                          <span className="text-sm text-gray-500">
                            ({getDeliveryRate(message)}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span>{message.readCount}</span>
                          <span className="text-sm text-gray-500">
                            ({getReadRate(message)}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {message.replyCount && message.replyCount > 0 ? (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4 text-purple-600" />
                            <span>{message.replyCount}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(message.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {formatDate(message.sentAt || message.createdAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Dialog */}
      <MessageStatsDialog
        open={statsDialogOpen}
        onOpenChange={setStatsDialogOpen}
        messageId={statsMessageId}
      />
    </div>
  );
}