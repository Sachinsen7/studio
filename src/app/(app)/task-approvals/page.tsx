'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, Clock, LoaderCircle, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type Task = {
  id: string;
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  requestedBy?: string;
  assignee?: { id: string; name: string; email: string; avatarUrl?: string };
  project?: { id: string; name: string };
  createdAt: string;
};

const priorityConfig = {
  Low: { label: 'Low', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  Medium: { label: 'Medium', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
  High: { label: 'High', color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
  Urgent: { label: 'Urgent', color: 'bg-red-500/10 text-red-600 border-red-200' },
};

export default function TaskApprovalsPage() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [processingId, setProcessingId] = React.useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({ title: 'Error', description: 'Failed to load tasks', variant: 'destructive' });
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (taskId: string, status: 'Approved' | 'Rejected') => {
    setProcessingId(taskId);
    try {
      const res = await fetch(`/api/tasks/${taskId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalStatus: status }),
      });
      
      if (!res.ok) throw new Error('Failed to update approval');
      
      const updatedTask = await res.json();
      setTasks(Array.isArray(tasks) ? tasks.map(t => t.id === taskId ? updatedTask : t) : [updatedTask]);
      
      toast({ 
        title: status === 'Approved' ? 'Task Approved' : 'Task Rejected', 
        description: `Task has been ${status.toLowerCase()}.` 
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update task', variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  const pendingTasks = Array.isArray(tasks) ? tasks.filter(t => t?.approvalStatus === 'Pending') : [];
  const approvedTasks = Array.isArray(tasks) ? tasks.filter(t => t?.approvalStatus === 'Approved') : [];
  const rejectedTasks = Array.isArray(tasks) ? tasks.filter(t => t?.approvalStatus === 'Rejected') : [];

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <PageHeader 
        title="Task Approvals" 
        description="Review and approve task requests from employees."
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-600">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingTasks.length}</p>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10 text-green-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedTasks.length}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500/10 text-red-600">
                <XCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rejectedTasks.length}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Task requests waiting for your review</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(pendingTasks) && pendingTasks.length > 0 ? pendingTasks.map((task) => (
                  <TableRow key={task?.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{task?.title || 'Untitled'}</p>
                        {task?.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={task?.assignee?.avatarUrl} />
                          <AvatarFallback>{task?.assignee?.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{task?.assignee?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{task?.assignee?.email || ''}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{task?.project?.name || 'No Project'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('text-xs', priorityConfig[task?.priority || 'Medium']?.color)}>
                        {task?.priority || 'Medium'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task?.dueDate ? (
                        <div className="flex items-center gap-1 text-sm">
                          <CalendarIcon className="h-3 w-3" />
                          {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproval(task.id, 'Approved')}
                          disabled={processingId === task.id}
                        >
                          {processingId === task.id ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleApproval(task.id, 'Rejected')}
                          disabled={processingId === task.id}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No pending tasks
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {pendingTasks.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No pending approvals</h3>
            <p className="text-muted-foreground text-sm">All task requests have been reviewed</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
