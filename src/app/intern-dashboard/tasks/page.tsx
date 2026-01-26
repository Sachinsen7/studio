'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useLoading, LoadingButton } from '@/hooks/use-loading';
import { useApiClient } from '@/lib/api-client';
import {
  LoaderCircle,
  GripVertical,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'ToDo' | 'InProgress' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string;
  projectId: string;
  project?: { id: string; name: string };
  createdAt: string;
};

const statusConfig = {
  ToDo: { label: 'To Do', color: 'bg-red-500', textColor: 'text-red-600', bgColor: 'bg-red-500/10' },
  InProgress: { label: 'In Progress', color: 'bg-yellow-500', textColor: 'text-yellow-600', bgColor: 'bg-yellow-500/10' },
  Done: { label: 'Done', color: 'bg-green-500', textColor: 'text-green-600', bgColor: 'bg-green-500/10' },
};

const priorityConfig = {
  Low: { label: 'Low', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  Medium: { label: 'Medium', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
  High: { label: 'High', color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
  Urgent: { label: 'Urgent', color: 'bg-red-500/10 text-red-600 border-red-200' },
};

function TaskCard({ task, onStatusChange }: { task: Task; onStatusChange: (taskId: string, newStatus: Task['status']) => void }) {
  const config = statusConfig[task.status];
  const priorityConf = priorityConfig[task.priority];

  return (
    <Card className="hover:bg-muted/50 transition-all duration-200 group">
      <CardContent className="p-4 flex items-center gap-4">
        <GripVertical className="h-5 w-5 text-muted-foreground/50 cursor-grab transition-colors group-hover:text-muted-foreground" />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium leading-snug">{task.title}</p>
            <Badge variant="outline" className={cn('font-normal text-xs', priorityConf.color)}>
              {task.priority}
            </Badge>
          </div>
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <Badge variant="outline" className="font-normal">{task.project?.name}</Badge>
            {task.dueDate && (
              <span className="text-xs flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {format(new Date(task.dueDate), 'MMM dd, yyyy')}
              </span>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            {task.status !== 'InProgress' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange(task.id, 'InProgress')}
                className="text-xs"
              >
                Start Working
              </Button>
            )}
            {task.status === 'InProgress' && (
              <Button
                size="sm"
                variant="default"
                onClick={() => onStatusChange(task.id, 'Done')}
                className="text-xs"
              >
                Mark as Done
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskColumn({ title, tasks, onStatusChange }: { title: Task['status']; tasks: Task[]; onStatusChange: (taskId: string, newStatus: Task['status']) => void }) {
  const config = statusConfig[title];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${config.color}`} />
        <h2 className="font-headline font-semibold tracking-wide text-lg">{config.label}</h2>
        <span className="ml-auto text-muted-foreground text-sm font-medium bg-muted/50 h-6 w-6 flex items-center justify-center rounded-full">
          {tasks.length}
        </span>
      </div>
      <div className="flex flex-col gap-3 h-full">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onStatusChange={onStatusChange} />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">No tasks</div>
        )}
      </div>
    </div>
  );
}

export default function InternTasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const apiClient = useApiClient();
  const { isLoading } = useLoading();
  const [loading, setLoading] = React.useState(true);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [internId, setInternId] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchData();
  }, [user?.email]);

  const fetchData = async () => {
    if (!user?.email) return;

    try {
      // Get intern data
      const internRes = await fetch(`/api/interns?email=${encodeURIComponent(user.email)}`);
      if (!internRes.ok) throw new Error('Failed to fetch intern data');
      
      const interns = await internRes.json();
      const currentIntern = Array.isArray(interns) ? interns.find((i: any) => i.email === user.email) : null;
      
      if (!currentIntern) {
        toast({
          title: 'Error',
          description: 'Intern profile not found',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      setInternId(currentIntern.id);

      // Fetch tasks
      const tasksRes = await fetch(`/api/tasks?internId=${currentIntern.id}`);
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    const result = await apiClient.put(
      `/api/tasks/${taskId}`,
      { status: newStatus },
      {
        loadingKey: `update-task-${taskId}`,
        successMessage: `Task moved to ${statusConfig[newStatus].label}`,
        showSuccessToast: true,
        onSuccess: () => {
          setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
          );
        },
      }
    );
  };

  const todoTasks = tasks.filter((t) => t.status === 'ToDo');
  const inProgressTasks = tasks.filter((t) => t.status === 'InProgress');
  const doneTasks = tasks.filter((t) => t.status === 'Done');

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
        title="My Tasks"
        description="Manage your assigned tasks"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">To Do</p>
                <p className="text-3xl font-bold">{todoTasks.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold">{inProgressTasks.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold">{doneTasks.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="grid gap-6 md:grid-cols-3">
        <TaskColumn title="ToDo" tasks={todoTasks} onStatusChange={handleStatusChange} />
        <TaskColumn title="InProgress" tasks={inProgressTasks} onStatusChange={handleStatusChange} />
        <TaskColumn title="Done" tasks={doneTasks} onStatusChange={handleStatusChange} />
      </div>

      {tasks.length === 0 && (
        <Card className="mt-6">
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Tasks Assigned</h3>
            <p className="text-muted-foreground">
              You don't have any tasks assigned yet. Check back later or contact your mentor.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
