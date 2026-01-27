'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import {
  LoaderCircle,
  PlusCircle,
  Star,
  Users,
  Calendar,
  Award,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type Intern = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  university?: string;
  degree?: string;
  startDate: string;
  endDate?: string;
  status: 'Upcoming' | 'Active' | 'Completed' | 'Terminated';
  project: string;
  evaluations?: Array<{
    id: string;
    rating: number;
    feedback?: string;
    createdAt: string;
  }>;
};

type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'ToDo' | 'InProgress' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate?: string;
  rating?: number;
  feedback?: string;
  createdAt: string;
};

type Project = {
  id: string;
  name: string;
};

const statusConfig = {
  Upcoming: { label: 'Upcoming', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  Active: { label: 'Active', color: 'bg-green-500/10 text-green-600 border-green-200' },
  Completed: { label: 'Completed', color: 'bg-gray-500/10 text-gray-600 border-gray-200' },
  Terminated: { label: 'Terminated', color: 'bg-red-500/10 text-red-600 border-red-200' },
};

const priorityConfig = {
  Low: { label: 'Low', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  Medium: { label: 'Medium', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
  High: { label: 'High', color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
  Urgent: { label: 'Urgent', color: 'bg-red-500/10 text-red-600 border-red-200' },
};

export default function MyInternsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [employeeId, setEmployeeId] = React.useState<string | null>(null);
  const [myInterns, setMyInterns] = React.useState<Intern[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [selectedIntern, setSelectedIntern] = React.useState<Intern | null>(null);
  const [internTasks, setInternTasks] = React.useState<Task[]>([]);
  
  // Dialog states
  const [assignTaskOpen, setAssignTaskOpen] = React.useState(false);
  const [evaluateOpen, setEvaluateOpen] = React.useState(false);
  const [rateTaskOpen, setRateTaskOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  
  // Form states
  const [newTask, setNewTask] = React.useState({
    title: '',
    description: '',
    priority: 'Medium' as Task['priority'],
    dueDate: '',
    projectId: '',
  });
  
  const [evaluation, setEvaluation] = React.useState({
    rating: 5,
    feedback: '',
    skills: {
      technical: 5,
      communication: 5,
      teamwork: 5,
      problemSolving: 5,
      timeManagement: 5,
    },
  });
  
  const [taskRating, setTaskRating] = React.useState({
    rating: 5,
    feedback: '',
  });

  React.useEffect(() => {
    fetchData();
  }, [user?.email]);

  const fetchData = async () => {
    if (!user?.email) return;

    try {
      // Get current employee
      const empRes = await fetch(`/api/employees/me?email=${encodeURIComponent(user.email)}`);
      if (!empRes.ok) {
        setLoading(false);
        return;
      }

      const currentEmployee = await empRes.json();
      setEmployeeId(currentEmployee.id);

      // Fetch interns where this employee is the mentor
      const internsRes = await fetch(`/api/interns?mentorId=${currentEmployee.id}`);
      if (internsRes.ok) {
        const internsData = await internsRes.json();
        setMyInterns(Array.isArray(internsData) ? internsData : []);
      }

      // Fetch projects
      const projectsRes = await fetch('/api/projects');
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load intern data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInternTasks = async (internId: string) => {
    try {
      const res = await fetch(`/api/tasks?assigneeId=${internId}&assigneeType=Intern`);
      if (res.ok) {
        const tasksData = await res.json();
        setInternTasks(Array.isArray(tasksData) ? tasksData : []);
      }
    } catch (error) {
      console.error('Error fetching intern tasks:', error);
    }
  };

  const handleSelectIntern = (intern: Intern) => {
    setSelectedIntern(intern);
    fetchInternTasks(intern.id);
  };

  const handleAssignTask = async () => {
    if (!selectedIntern || !newTask.title || !newTask.projectId) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTask,
          assigneeId: selectedIntern.id,
          assigneeType: 'Intern',
          status: 'ToDo',
          approvalStatus: 'Approved',
          requestedBy: employeeId,
        }),
      });

      if (!res.ok) throw new Error('Failed to assign task');

      await res.json();
      await fetchInternTasks(selectedIntern.id);
      setAssignTaskOpen(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'Medium',
        dueDate: '',
        projectId: '',
      });

      toast({
        title: 'Success',
        description: 'Task assigned successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign task',
        variant: 'destructive',
      });
    }
  };

  const handleEvaluateIntern = async () => {
    if (!selectedIntern || !employeeId) return;

    try {
      const res = await fetch(`/api/interns/${selectedIntern.id}/evaluations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: employeeId,
          mentorName: user?.name || 'Mentor',
          rating: evaluation.rating,
          feedback: evaluation.feedback,
          skills: evaluation.skills,
        }),
      });

      if (!res.ok) throw new Error('Failed to create evaluation');

      await res.json();
      await fetchData(); // Refresh intern data
      setEvaluateOpen(false);
      setEvaluation({
        rating: 5,
        feedback: '',
        skills: {
          technical: 5,
          communication: 5,
          teamwork: 5,
          problemSolving: 5,
          timeManagement: 5,
        },
      });

      toast({
        title: 'Success',
        description: 'Evaluation submitted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit evaluation',
        variant: 'destructive',
      });
    }
  };

  const handleRateTask = async () => {
    if (!selectedTask || !employeeId) return;

    try {
      const res = await fetch(`/api/tasks/${selectedTask.id}/rate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: taskRating.rating,
          feedback: taskRating.feedback,
          ratedBy: employeeId,
        }),
      });

      if (!res.ok) throw new Error('Failed to rate task');

      await res.json();
      if (selectedIntern) {
        await fetchInternTasks(selectedIntern.id);
      }
      setRateTaskOpen(false);
      setSelectedTask(null);
      setTaskRating({ rating: 5, feedback: '' });

      toast({
        title: 'Success',
        description: 'Task rated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to rate task',
        variant: 'destructive',
      });
    }
  };

  const getAverageRating = (intern: Intern) => {
    if (!intern.evaluations || intern.evaluations.length === 0) return 0;
    const sum = intern.evaluations.reduce((acc, eval) => acc + eval.rating, 0);
    return sum / intern.evaluations.length;
  };

  const getTaskStats = (tasks: Task[]) => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Done').length;
    const inProgress = tasks.filter(t => t.status === 'InProgress').length;
    const todo = tasks.filter(t => t.status === 'ToDo').length;
    
    return { total, completed, inProgress, todo };
  };

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
        title="My Interns"
        description="Manage and mentor your assigned interns"
      >
        {selectedIntern && (
          <div className="flex gap-2">
            <Button onClick={() => setAssignTaskOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Assign Task
            </Button>
            <Button variant="outline" onClick={() => setEvaluateOpen(true)}>
              <Star className="h-4 w-4 mr-2" />
              Evaluate
            </Button>
          </div>
        )}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Interns List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                My Interns ({myInterns.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {myInterns.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No interns assigned yet</p>
                </div>
              ) : (
                myInterns.map((intern) => {
                  const avgRating = getAverageRating(intern);
                  return (
                    <Card
                      key={intern.id}
                      className={cn(
                        "cursor-pointer transition-all hover:shadow-md",
                        selectedIntern?.id === intern.id && "ring-2 ring-primary"
                      )}
                      onClick={() => handleSelectIntern(intern)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarImage src={intern.avatarUrl} />
                            <AvatarFallback>
                              {intern.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{intern.name}</p>
                            <p className="text-sm text-muted-foreground truncate">
                              {intern.university}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant="outline"
                                className={cn('text-xs', statusConfig[intern.status].color)}
                              >
                                {statusConfig[intern.status].label}
                              </Badge>
                              {avgRating > 0 && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs font-medium">
                                    {avgRating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Intern Details */}
        <div className="lg:col-span-2">
          {selectedIntern ? (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={selectedIntern.avatarUrl} />
                        <AvatarFallback className="text-lg">
                          {selectedIntern.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle>{selectedIntern.name}</CardTitle>
                        <CardDescription>{selectedIntern.email}</CardDescription>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge
                            variant="outline"
                            className={cn('text-xs', statusConfig[selectedIntern.status].color)}
                          >
                            {statusConfig[selectedIntern.status].label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {selectedIntern.university}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Start Date</Label>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(selectedIntern.startDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      {selectedIntern.endDate && (
                        <div>
                          <Label className="text-sm font-medium">End Date</Label>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(selectedIntern.endDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Performance Overview */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Performance Overview</Label>
                      <div className="grid grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-2xl font-bold">
                                {getAverageRating(selectedIntern).toFixed(1)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">Avg Rating</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold mb-2">
                              {selectedIntern.evaluations?.length || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">Evaluations</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold mb-2">
                              {getTaskStats(internTasks).completed}
                            </div>
                            <p className="text-xs text-muted-foreground">Tasks Done</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Assigned Tasks</CardTitle>
                      <Button onClick={() => setAssignTaskOpen(true)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Assign Task
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {internTasks.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No tasks assigned yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {internTasks.map((task) => (
                          <Card key={task.id} className="hover:shadow-sm transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium">{task.title}</h4>
                                    <Badge
                                      variant="outline"
                                      className={cn('text-xs', priorityConfig[task.priority].color)}
                                    >
                                      {task.priority}
                                    </Badge>
                                  </div>
                                  {task.description && (
                                    <p className="text-sm text-muted-foreground mb-2">
                                      {task.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>Status: {task.status}</span>
                                    {task.dueDate && (
                                      <span>Due: {format(new Date(task.dueDate), 'MMM dd')}</span>
                                    )}
                                    {task.rating && (
                                      <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        <span>{task.rating}/5</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {task.status === 'Done' && !task.rating && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedTask(task);
                                      setRateTaskOpen(true);
                                    }}
                                  >
                                    <Star className="h-4 w-4 mr-1" />
                                    Rate
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="evaluations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Performance Evaluations</CardTitle>
                      <Button onClick={() => setEvaluateOpen(true)}>
                        <Award className="h-4 w-4 mr-2" />
                        New Evaluation
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!selectedIntern.evaluations || selectedIntern.evaluations.length === 0 ? (
                      <div className="text-center py-8">
                        <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No evaluations yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedIntern.evaluations.map((evaluation) => (
                          <Card key={evaluation.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={cn(
                                          "h-4 w-4",
                                          i < evaluation.rating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                        )}
                                      />
                                    ))}
                                  </div>
                                  <span className="font-medium">{evaluation.rating}/5</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(evaluation.createdAt), 'MMM dd, yyyy')}
                                </span>
                              </div>
                              {evaluation.feedback && (
                                <p className="text-sm text-muted-foreground">
                                  {evaluation.feedback}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">Select an Intern</h3>
                <p className="text-muted-foreground text-center">
                  Choose an intern from the list to view their details and manage their tasks
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Assign Task Dialog */}
      <Dialog open={assignTaskOpen} onOpenChange={setAssignTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Task to {selectedIntern?.name}</DialogTitle>
            <DialogDescription>
              Create a new task for your intern to work on
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="task-title">Task Title *</Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
              />
            </div>
            <div>
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Describe the task requirements"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value: Task['priority']) => setNewTask({ ...newTask, priority: value })}
                >
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
              <div>
                <Label htmlFor="task-due-date">Due Date</Label>
                <Input
                  id="task-due-date"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Project *</Label>
              <Select
                value={newTask.projectId}
                onValueChange={(value) => setNewTask({ ...newTask, projectId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignTask}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Assign Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Evaluate Intern Dialog */}
      <Dialog open={evaluateOpen} onOpenChange={setEvaluateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Evaluate {selectedIntern?.name}</DialogTitle>
            <DialogDescription>
              Provide performance feedback and ratings for your intern
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label>Overall Rating</Label>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setEvaluation({ ...evaluation, rating })}
                    className="p-1"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6 transition-colors",
                        rating <= evaluation.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 hover:text-yellow-300"
                      )}
                    />
                  </button>
                ))}
                <span className="ml-2 font-medium">{evaluation.rating}/5</span>
              </div>
            </div>

            <div>
              <Label>Skill Ratings</Label>
              <div className="space-y-3 mt-2">
                {Object.entries(evaluation.skills).map(([skill, rating]) => (
                  <div key={skill} className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {skill.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setEvaluation({
                            ...evaluation,
                            skills: { ...evaluation.skills, [skill]: r }
                          })}
                          className="p-1"
                        >
                          <Star
                            className={cn(
                              "h-4 w-4 transition-colors",
                              r <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300 hover:text-yellow-300"
                            )}
                          />
                        </button>
                      ))}
                      <span className="text-sm w-8">{rating}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="evaluation-feedback">Feedback</Label>
              <Textarea
                id="evaluation-feedback"
                value={evaluation.feedback}
                onChange={(e) => setEvaluation({ ...evaluation, feedback: e.target.value })}
                placeholder="Provide detailed feedback on performance, areas of improvement, and strengths"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEvaluateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEvaluateIntern}>
              <Award className="h-4 w-4 mr-2" />
              Submit Evaluation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rate Task Dialog */}
      <Dialog open={rateTaskOpen} onOpenChange={setRateTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate Task: {selectedTask?.title}</DialogTitle>
            <DialogDescription>
              Provide a rating and feedback for the completed task
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Task Rating</Label>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setTaskRating({ ...taskRating, rating })}
                    className="p-1"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6 transition-colors",
                        rating <= taskRating.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300 hover:text-yellow-300"
                      )}
                    />
                  </button>
                ))}
                <span className="ml-2 font-medium">{taskRating.rating}/5</span>
              </div>
            </div>
            <div>
              <Label htmlFor="task-feedback">Feedback</Label>
              <Textarea
                id="task-feedback"
                value={taskRating.feedback}
                onChange={(e) => setTaskRating({ ...taskRating, feedback: e.target.value })}
                placeholder="Provide feedback on the task completion quality"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRateTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRateTask}>
              <Star className="h-4 w-4 mr-2" />
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}