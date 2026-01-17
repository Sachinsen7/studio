'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Users,
  ListTodo,
  CheckCircle2,
  AlertCircle,
  Github,
  ExternalLink,
  LoaderCircle,
  PlusCircle,
  Crown,
  User,
  Calendar,
  Clock,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useLoading, LoadingButton, LoadingOverlay } from '@/hooks/use-loading';
import { useApiClient } from '@/lib/api-client';

type Employee = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
};

type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'ToDo' | 'InProgress' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string;
  createdAt: string;
};

type Project = {
  id: string;
  name: string;
  clientName?: string;
  status: 'OnTrack' | 'AtRisk' | 'Completed';
  progress: number;
  startDate?: string;
  endDate?: string;
  description?: string;
  githubRepo?: string;
  techStack?: string;
  team: Employee[];
  tasks: Task[];
  isPrimary: boolean;
};

type EmployeeData = {
  employee: {
    id: string;
    name: string;
    email: string;
    role: string;
    project: string;
    projects: string[];
    avatarUrl?: string;
  };
  projects: Project[];
};

const statusConfig = {
  OnTrack: { label: 'On Track', color: 'bg-green-500/10 text-green-600 border-green-200', icon: CheckCircle2 },
  AtRisk: { label: 'At Risk', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200', icon: AlertCircle },
  Completed: { label: 'Completed', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: CheckCircle2 },
};

const priorityColors = {
  Low: 'bg-gray-500/10 text-gray-600',
  Medium: 'bg-blue-500/10 text-blue-600',
  High: 'bg-orange-500/10 text-orange-600',
  Urgent: 'bg-red-500/10 text-red-600',
};

const taskStatusColors = {
  ToDo: 'bg-gray-500/10 text-gray-600',
  InProgress: 'bg-blue-500/10 text-blue-600',
  Done: 'bg-green-500/10 text-green-600',
};

export default function MyProjectsPage() {
  const [data, setData] = React.useState<EmployeeData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [addLogDialogOpen, setAddLogDialogOpen] = React.useState(false);
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = React.useState(false);
  const [newLog, setNewLog] = React.useState({ summary: '', hoursWorked: '', category: 'General' });
  const [newTask, setNewTask] = React.useState({
    title: '',
    description: '',
    assigneeId: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Urgent',
    dueDate: '',
  });
  
  const auth = useAuth();
  const { user } = useUser(auth);
  const { toast } = useToast();
  const { isLoading } = useLoading();
  const api = useApiClient();

  React.useEffect(() => {
    if (user?.email) {
      fetchEmployeeData();
    }
  }, [user]);

  const fetchEmployeeData = async () => {
    if (!user?.email) return;
    
    try {
      console.log('Fetching employee data for email:', user.email);
      const res = await fetch(`/api/employees/me?email=${encodeURIComponent(user.email)}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('API Error:', errorData);
        
        if (res.status === 404) {
          toast({ 
            title: 'Employee Profile Not Found', 
            description: `No employee profile found for ${user.email}. Please contact your administrator.`,
            variant: 'destructive',
            duration: 10000
          });
        } else {
          throw new Error(errorData.error || 'Failed to fetch employee data');
        }
        return;
      }
      
      const employeeData = await res.json();
      console.log('Employee data loaded:', employeeData);
      setData(employeeData);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to load your projects. Please try refreshing the page.',
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async () => {
    if (!selectedProject || !newLog.summary) return;
    
    const result = await api.post(
      `/api/projects/${encodeURIComponent(selectedProject.name)}/daily-logs`,
      {
        ...newLog,
        employeeId: data?.employee.id,
        hoursWorked: newLog.hoursWorked ? parseFloat(newLog.hoursWorked) : null,
      },
      {
        loadingKey: 'add-project-log',
        successMessage: 'Daily log added successfully!',
        showSuccessToast: true,
        onSuccess: () => {
          setAddLogDialogOpen(false);
          setNewLog({ summary: '', hoursWorked: '', category: 'General' });
        }
      }
    );
  };

  const handleCreateTask = async () => {
    if (!selectedProject || !newTask.title || !newTask.assigneeId) return;
    
    const result = await api.post(
      '/api/tasks',
      {
        ...newTask,
        projectId: selectedProject.id,
        dueDate: newTask.dueDate || null,
        requestedBy: data?.employee.id,
      },
      {
        loadingKey: 'create-task',
        successMessage: 'Task created successfully!',
        showSuccessToast: true,
        onSuccess: () => {
          setCreateTaskDialogOpen(false);
          setNewTask({
            title: '',
            description: '',
            assigneeId: '',
            priority: 'Medium',
            dueDate: '',
          });
          // Refresh employee data to get updated tasks
          fetchEmployeeData();
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold text-lg mb-2">Employee Profile Not Found</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Your employee profile could not be found. This might happen if:
        </p>
        <ul className="text-sm text-muted-foreground space-y-1 mb-4">
          <li>• Your account hasn't been set up in the system yet</li>
          <li>• Your email doesn't match the registered employee email</li>
          <li>• You're using a different email than expected</li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Current email: <code className="bg-muted px-2 py-1 rounded">{user?.email}</code>
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Please contact your administrator to set up your employee profile.
        </p>
      </div>
    );
  }

  const isTeamLead = data.employee.role === 'TeamLead';
  const primaryProject = data.projects.find(p => p.isPrimary);
  const memberProjects = data.projects.filter(p => !p.isPrimary);

  return (
    <LoadingOverlay loading={loading} loadingText="Loading your projects...">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
          <p className="text-muted-foreground">
            {isTeamLead ? 'Manage your projects and team' : 'View your assigned projects and tasks'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isTeamLead ? "default" : "secondary"} className="gap-1">
            {isTeamLead ? <Crown className="h-3 w-3" /> : <User className="h-3 w-3" />}
            {data.employee.role}
          </Badge>
        </div>
      </div>

      {/* Projects Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ListTodo className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.projects.length}</p>
                <p className="text-sm text-muted-foreground">Total Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {data.projects.reduce((acc, p) => acc + (p.tasks?.length || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">My Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {isTeamLead && primaryProject && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{primaryProject.team?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Team Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Primary Project (for TeamLeads) */}
      {isTeamLead && primaryProject && (
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <CardTitle>Primary Project - {primaryProject.name}</CardTitle>
              </div>
              <Badge variant="outline" className={cn('text-xs', statusConfig[primaryProject.status].color)}>
                {React.createElement(statusConfig[primaryProject.status].icon, { className: "h-3 w-3 mr-1" })}
                {statusConfig[primaryProject.status].label}
              </Badge>
            </div>
            {primaryProject.clientName && (
              <CardDescription>Client: {primaryProject.clientName}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{primaryProject.progress}%</span>
              </div>
              <Progress value={primaryProject.progress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Team Members ({primaryProject.team?.length || 0})</p>
                <div className="flex -space-x-2">
                  {(primaryProject.team || []).slice(0, 5).map((member) => (
                    <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                      <AvatarImage src={member.avatarUrl} />
                      <AvatarFallback className="text-xs">{member.name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                  ))}
                  {(primaryProject.team?.length || 0) > 5 && (
                    <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <span className="text-xs font-medium">+{(primaryProject.team?.length || 0) - 5}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">My Tasks ({primaryProject.tasks?.length || 0})</p>
                <div className="flex gap-1">
                  {Object.entries(
                    (primaryProject.tasks || []).reduce((acc, task) => {
                      acc[task.status] = (acc[task.status] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([status, count]) => (
                    <Badge key={status} variant="outline" className={cn('text-xs', taskStatusColors[status as keyof typeof taskStatusColors])}>
                      {count} {status}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={() => setSelectedProject(primaryProject)}>
                View Details
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                setSelectedProject(primaryProject);
                setAddLogDialogOpen(true);
              }}>
                <Clock className="h-4 w-4 mr-1" />
                Add Log
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                setSelectedProject(primaryProject);
                setCreateTaskDialogOpen(true);
              }}>
                <PlusCircle className="h-4 w-4 mr-1" />
                Create Task
              </Button>
              {primaryProject.githubRepo && (
                <Button size="sm" variant="outline" asChild>
                  <a href={primaryProject.githubRepo} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4 mr-1" />
                    GitHub
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Projects */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {isTeamLead ? 'All Projects' : 'Assigned Projects'}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.projects.map((project) => {
            const StatusIcon = statusConfig[project.status].icon;
            return (
              <Card key={project.id} className={cn(
                "hover:shadow-lg transition-shadow cursor-pointer",
                project.isPrimary && "border-primary/20"
              )} onClick={() => setSelectedProject(project)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        {project.isPrimary && <Crown className="h-4 w-4 text-primary" />}
                      </div>
                      {project.clientName && (
                        <CardDescription className="mt-1">{project.clientName}</CardDescription>
                      )}
                    </div>
                    <Badge variant="outline" className={cn('text-xs', statusConfig[project.status].color)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig[project.status].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <ListTodo className="h-4 w-4" />
                      <span>{project.tasks?.length || 0} tasks</span>
                    </div>
                    {isTeamLead && project.isPrimary && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{project.team?.length || 0} members</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Project Details Dialog */}
      {selectedProject && (
        <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle>{selectedProject.name}</DialogTitle>
                {selectedProject.isPrimary && <Crown className="h-5 w-5 text-primary" />}
              </div>
              {selectedProject.clientName && (
                <DialogDescription>Client: {selectedProject.clientName}</DialogDescription>
              )}
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tasks">My Tasks</TabsTrigger>
                {isTeamLead && selectedProject.isPrimary && (
                  <TabsTrigger value="team">Team</TabsTrigger>
                )}
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedProject.description || 'No description provided'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Progress</h4>
                  <Progress value={selectedProject.progress} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-1">{selectedProject.progress}% complete</p>
                </div>
                {selectedProject.techStack && (
                  <div>
                    <h4 className="font-semibold mb-2">Tech Stack</h4>
                    <div className="flex gap-1 flex-wrap">
                      {selectedProject.techStack.split(',').map((tech, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{tech.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="tasks" className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">My Tasks</h4>
                  {isTeamLead && selectedProject.isPrimary && (
                    <Button size="sm" onClick={() => setCreateTaskDialogOpen(true)}>
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Create Task
                    </Button>
                  )}
                </div>
                {(selectedProject.tasks || []).length > 0 ? (
                  (selectedProject.tasks || []).map((task) => (
                    <Card key={task.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{task.title}</p>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                            )}
                            {task.dueDate && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                <Calendar className="h-3 w-3" />
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className={cn('text-xs', priorityColors[task.priority])}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className={cn('text-xs', taskStatusColors[task.status])}>
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No tasks assigned</p>
                )}
              </TabsContent>
              
              {isTeamLead && selectedProject.isPrimary && (
                <TabsContent value="team" className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Team Members</h4>
                    <Button size="sm" onClick={() => setCreateTaskDialogOpen(true)}>
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Assign Task
                    </Button>
                  </div>
                  {(selectedProject.team || []).map((member) => (
                    <Card key={member.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatarUrl} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{member.role}</Badge>
                            {member.id !== data?.employee.id && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => {
                                  setNewTask(prev => ({ ...prev, assigneeId: member.id }));
                                  setCreateTaskDialogOpen(true);
                                }}
                              >
                                <PlusCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              )}
              
              <TabsContent value="details" className="space-y-4 mt-4">
                {selectedProject.githubRepo && (
                  <div>
                    <h4 className="font-semibold mb-2">GitHub Repository</h4>
                    <a href={selectedProject.githubRepo} target="_blank" rel="noopener noreferrer" 
                       className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Github className="h-4 w-4" />
                      {selectedProject.githubRepo}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {selectedProject.startDate && (
                    <div>
                      <h4 className="font-semibold mb-1">Start Date</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedProject.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {selectedProject.endDate && (
                    <div>
                      <h4 className="font-semibold mb-1">End Date</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedProject.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Daily Log Dialog */}
      <Dialog open={addLogDialogOpen} onOpenChange={setAddLogDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Daily Log</DialogTitle>
            <DialogDescription>
              Record your daily work progress for {selectedProject?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="summary">Work Summary *</Label>
              <Textarea
                id="summary"
                placeholder="Describe what you worked on today..."
                value={newLog.summary}
                onChange={(e) => setNewLog(prev => ({ ...prev, summary: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hours">Hours Worked</Label>
              <Input
                id="hours"
                type="number"
                step="0.5"
                min="0"
                max="24"
                placeholder="8.0"
                value={newLog.hoursWorked}
                onChange={(e) => setNewLog(prev => ({ ...prev, hoursWorked: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={newLog.category} onValueChange={(v) => setNewLog(prev => ({ ...prev, category: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Feature">Feature Development</SelectItem>
                  <SelectItem value="BugFix">Bug Fix</SelectItem>
                  <SelectItem value="Documentation">Documentation</SelectItem>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="Review">Code Review</SelectItem>
                  <SelectItem value="Deployment">Deployment</SelectItem>
                  <SelectItem value="Environment">Environment Setup</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddLogDialogOpen(false)}>
              Cancel
            </Button>
            <LoadingButton 
              onClick={handleAddLog} 
              disabled={!newLog.summary}
              loading={isLoading('add-project-log')}
              loadingText="Adding..."
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Log
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Create Task Dialog */}
      <Dialog open={createTaskDialogOpen} onOpenChange={setCreateTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Assign a new task to a team member in {selectedProject?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="task-title">Task Title *</Label>
              <Input
                id="task-title"
                placeholder="Enter task title..."
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                placeholder="Describe the task requirements..."
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="task-assignee">Assign To *</Label>
              <Select value={newTask.assigneeId} onValueChange={(v) => setNewTask(prev => ({ ...prev, assigneeId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {(selectedProject?.team || []).map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member.avatarUrl} />
                          <AvatarFallback className="text-xs">{member.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                        <Badge variant="outline" className="text-xs">{member.role}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="task-priority">Priority</Label>
                <Select value={newTask.priority} onValueChange={(v) => setNewTask(prev => ({ ...prev, priority: v as typeof newTask.priority }))}>
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
                <Label htmlFor="task-due-date">Due Date</Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateTaskDialogOpen(false)}>
              Cancel
            </Button>
            <LoadingButton 
              onClick={handleCreateTask} 
              disabled={!newTask.title || !newTask.assigneeId}
              loading={isLoading('create-task')}
              loadingText="Creating..."
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Task
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </LoadingOverlay>
  );
}