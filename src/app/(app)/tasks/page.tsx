'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import {
  PlusCircle,
  GripVertical,
  Search,
  Filter,
  Calendar as CalendarIcon,
  AlertCircle,
  Clock,
  CheckCircle2,
  LayoutList,
  LayoutGrid as LayoutGridIcon,
  LoaderCircle,
  MessageSquare,
  Paperclip,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'ToDo' | 'InProgress' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  assigneeId?: string;
  assigneeType: 'Employee' | 'Intern';
  internId?: string;
  projectId: string;
  assignee?: { id: string; name: string; email: string; avatarUrl?: string };
  intern?: { id: string; name: string; email: string; avatarUrl?: string };
  project?: { id: string; name: string };
  createdAt: string;
  comments?: Array<{ id: string; content: string; createdAt: string; author?: { name: string } }>;
};

type Employee = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

type Intern = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  university?: string;
  status?: string;
};

type TeamMember = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  type: 'Employee' | 'Intern';
  role?: string;
  university?: string;
};

type Project = {
  id: string;
  name: string;
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

function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const config = statusConfig[task.status];
  const priorityConf = priorityConfig[task.priority];

  // Get the assignee (either employee or intern)
  const assignee = task.assigneeType === 'Intern' ? task.intern : task.assignee;

  return (
    <Card className="hover:bg-muted/50 transition-all duration-200 group cursor-pointer" onClick={onClick}>
      <CardContent className="p-4 flex items-center gap-4">
        <GripVertical className="h-5 w-5 text-muted-foreground/50 cursor-grab transition-colors group-hover:text-muted-foreground" />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium leading-snug">{task.title}</p>
            <div className="flex gap-1">
              <Badge variant="outline" className={cn('font-normal text-xs', priorityConf.color)}>
                {task.priority}
              </Badge>
              {task.approvalStatus === 'Pending' && (
                <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600 border-yellow-200">
                  Pending
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <Badge variant="outline" className="font-normal">{task.project?.name}</Badge>
            <div className="flex items-center gap-2">
              {task.dueDate && (
                <span className="text-xs flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {format(new Date(task.dueDate), 'MMM dd')}
                </span>
              )}
              {assignee && (
                <div className="flex items-center gap-1">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={assignee.avatarUrl} alt={assignee.name} />
                    <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {task.assigneeType === 'Intern' && (
                    <span className="text-xs text-muted-foreground">(I)</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskColumn({ title, tasks, onTaskClick }: { title: Task['status']; tasks: Task[]; onTaskClick: (task: Task) => void }) {
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
          <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">No tasks</div>
        )}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [interns, setInterns] = React.useState<Intern[]>([]);
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [viewMode, setViewMode] = React.useState<'board' | 'list'>('board');
  const [dueDatePopoverOpen, setDueDatePopoverOpen] = React.useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all');
  const [dueDateFilter, setDueDateFilter] = React.useState<string>('all');

  // Create form
  const [newTask, setNewTask] = React.useState({
    title: '',
    description: '',
    priority: 'Medium' as Task['priority'],
    dueDate: undefined as Date | undefined,
    status: 'ToDo' as Task['status'],
    assigneeId: '',
    assigneeType: '' as 'Employee' | 'Intern' | '',
    projectId: '',
  });
  const [creating, setCreating] = React.useState(false);
  const [newComment, setNewComment] = React.useState('');

  const { toast } = useToast();

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, employeesRes, internsRes, projectsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/employees?active=true'), // Only fetch active employees
        fetch('/api/interns'),
        fetch('/api/projects'),
      ]);

      const tasksData = await tasksRes.json();
      const employeesData = await employeesRes.json();
      const internsData = await internsRes.json();
      const projectsData = await projectsRes.json();

      setTasks(Array.isArray(tasksData) ? tasksData : []);
      
      // Employees are already filtered as active from API
      setEmployees(Array.isArray(employeesData) ? employeesData : []);
      
      // Filter only active interns
      const activeInterns = Array.isArray(internsData)
        ? internsData.filter((intern: any) => intern.status === 'Active' || intern.status === 'Upcoming')
        : [];
      setInterns(activeInterns);
      
      // Combine employees and interns into team members
      const combinedTeamMembers: TeamMember[] = [
        ...employeesData.map((emp: any) => ({
          id: emp.id,
          name: emp.name,
          email: emp.email,
          avatarUrl: emp.avatarUrl,
          type: 'Employee' as const,
          role: emp.role,
        })),
        ...activeInterns.map((intern: any) => ({
          id: intern.id,
          name: intern.name,
          email: intern.email,
          avatarUrl: intern.avatarUrl,
          type: 'Intern' as const,
          university: intern.university,
        })),
      ];
      setTeamMembers(combinedTeamMembers);
      
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Error', description: 'Failed to load tasks', variant: 'destructive' });
      setTasks([]);
      setEmployees([]);
      setInterns([]);
      setTeamMembers([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.assigneeId || !newTask.assigneeType || !newTask.projectId) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          dueDate: newTask.dueDate?.toISOString(),
        }),
      });

      if (!res.ok) throw new Error('Failed to create task');

      const createdTask = await res.json();
      setTasks([createdTask, ...(Array.isArray(tasks) ? tasks : [])]);
      setCreateDialogOpen(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'Medium',
        dueDate: undefined,
        status: 'ToDo',
        assigneeId: '',
        assigneeType: '',
        projectId: '',
      });
      toast({ title: 'Success', description: 'Task created successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create task', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleAddComment = async () => {
    // Comment functionality not implemented yet
    toast({ title: 'Info', description: 'Comment functionality coming soon' });
  };

  // Filter tasks
  const filteredTasks = Array.isArray(tasks) ? tasks.filter((task) => {
    if (searchQuery && !task?.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter !== 'all' && task?.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && task?.priority !== priorityFilter) return false;

    if (dueDateFilter !== 'all' && task?.dueDate) {
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dueDateFilter === 'overdue' && dueDate >= today) return false;
      if (dueDateFilter === 'today' && dueDate.toDateString() !== today.toDateString()) return false;
      if (dueDateFilter === 'week') {
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        if (dueDate < today || dueDate > weekFromNow) return false;
      }
    }

    return true;
  }) : [];

  const todoTasks = filteredTasks.filter((t) => t?.status === 'ToDo');
  const inProgressTasks = filteredTasks.filter((t) => t?.status === 'InProgress');
  const doneTasks = filteredTasks.filter((t) => t?.status === 'Done');

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Task Board" description="Organize and track your team's work.">
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === 'board' ? 'list' : 'board')}>
            {viewMode === 'board' ? <LayoutList className="h-4 w-4" /> : <LayoutGridIcon className="h-4 w-4" />}
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ToDo">To Do</SelectItem>
            <SelectItem value="InProgress">In Progress</SelectItem>
            <SelectItem value="Done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dueDateFilter} onValueChange={setDueDateFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Due Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Board View */}
      {viewMode === 'board' && (
        <div className="grid md:grid-cols-3 gap-6 items-start">
          <TaskColumn title="ToDo" tasks={todoTasks} onTaskClick={setSelectedTask} />
          <TaskColumn title="InProgress" tasks={inProgressTasks} onTaskClick={setSelectedTask} />
          <TaskColumn title="Done" tasks={doneTasks} onTaskClick={setSelectedTask} />
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Project</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(filteredTasks) && filteredTasks.length > 0 ? filteredTasks.map((task) => {
                const priorityConf = priorityConfig[task?.priority || 'Medium'];
                const statusConf = statusConfig[task?.status || 'ToDo'];
                const assignee = task?.assigneeType === 'Intern' ? task?.intern : task?.assignee;
                return (
                  <TableRow key={task?.id} className="cursor-pointer" onClick={() => setSelectedTask(task)}>
                    <TableCell className="font-medium">{task?.title || 'Untitled'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('text-xs', priorityConf?.color)}>
                        {task?.priority || 'Medium'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task?.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('text-xs', statusConf?.textColor)}>
                        {statusConf?.label || 'To Do'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={assignee?.avatarUrl} />
                          <AvatarFallback>{assignee?.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm">{assignee?.name || 'Unassigned'}</span>
                          {task?.assigneeType === 'Intern' && (
                            <span className="text-xs text-muted-foreground">Intern</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{task?.project?.name || 'No Project'}</TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No tasks found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Create Task Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={(open) => {
        setCreateDialogOpen(open);
        if (!open) {
          setDueDatePopoverOpen(false);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add a new task and assign it to a team member.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Task description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Priority *</Label>
                <Select value={newTask.priority} onValueChange={(v) => setNewTask({ ...newTask, priority: v as Task['priority'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Due Date (Optional)</Label>
                <Input
                  type="date"
                  value={newTask.dueDate ? format(newTask.dueDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    setNewTask({ 
                      ...newTask, 
                      dueDate: dateValue ? new Date(dateValue) : undefined 
                    });
                  }}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Status *</Label>
                <Select value={newTask.status} onValueChange={(v) => setNewTask({ ...newTask, status: v as Task['status'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ToDo">To Do</SelectItem>
                    <SelectItem value="InProgress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Assigned To *</Label>
                <Select 
                  value={newTask.assigneeId} 
                  onValueChange={(v) => {
                    const selectedMember = teamMembers.find(m => m.id === v);
                    setNewTask({ 
                      ...newTask, 
                      assigneeId: v,
                      assigneeType: selectedMember?.type || ''
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.length > 0 ? (
                      <>
                        {/* Group Employees */}
                        {teamMembers.filter(m => m.type === 'Employee').length > 0 && (
                          <>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                              Employees
                            </div>
                            {teamMembers.filter(m => m.type === 'Employee').map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={member.avatarUrl} />
                                    <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  {member.name} - {member.role}
                                </div>
                              </SelectItem>
                            ))}
                          </>
                        )}

                        {/* Group Interns */}
                        {teamMembers.filter(m => m.type === 'Intern').length > 0 && (
                          <>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                              Interns
                            </div>
                            {teamMembers.filter(m => m.type === 'Intern').map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={member.avatarUrl} />
                                    <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  {member.name} - {member.university || 'Intern'}
                                </div>
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </>
                    ) : (
                      <SelectItem value="no-members" disabled>No team members available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Project *</Label>
              <Select value={newTask.projectId} onValueChange={(v) => setNewTask({ ...newTask, projectId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(projects) && projects.length > 0 ? projects.map((proj) => (
                    <SelectItem key={proj.id} value={proj.id}>
                      {proj.name}
                    </SelectItem>
                  )) : (
                    <SelectItem value="no-projects" disabled>No projects available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTask} disabled={creating}>
              {creating ? <LoaderCircle className="h-4 w-4 animate-spin mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Details Sheet */}
      <Sheet open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selectedTask && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedTask.title}</SheetTitle>
                <SheetDescription>Task details and activity</SheetDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={cn('text-xs', priorityConfig[selectedTask.priority].color)}>
                    {selectedTask.priority}
                  </Badge>
                  <Badge variant="outline" className={cn('text-xs', statusConfig[selectedTask.status].textColor)}>
                    {statusConfig[selectedTask.status].label}
                  </Badge>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedTask.description || 'No description provided'}
                  </p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Assignee</h4>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const assignee = selectedTask.assigneeType === 'Intern' ? selectedTask.intern : selectedTask.assignee;
                        return (
                          <>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={assignee?.avatarUrl} />
                              <AvatarFallback>{assignee?.name?.charAt(0) || '?'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{assignee?.name || 'Unassigned'}</p>
                              <p className="text-xs text-muted-foreground">
                                {assignee?.email} {selectedTask.assigneeType === 'Intern' && '(Intern)'}
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Project</h4>
                    <Badge variant="outline">{selectedTask.project?.name}</Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Due Date</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedTask.dueDate ? format(new Date(selectedTask.dueDate), 'PPP') : 'No due date'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Created</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedTask.createdAt), 'PPP')}
                    </p>
                  </div>
                </div>

                {/* Comments & Activity */}
                <div>
                  <h4 className="font-semibold mb-3">Comments & Activity</h4>
                  <div className="space-y-3 mb-4">
                    <p className="text-sm text-muted-foreground">Comments feature coming soon</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
