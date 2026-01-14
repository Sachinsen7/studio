'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ListTodo, CheckCircle2, CalendarCheck, ArrowUpRight, FolderKanban, Users, Clock } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { tasks, leaveRequests, employees, projects } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import * as React from 'react';

export default function EmployeeDashboardPage() {
  const auth = useAuth();
  const { user } = useUser(auth);
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Update clock every second
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Find the current employee from mock data
  const currentEmployee = user ? employees.find(e => e.email === user.email) : null;

  const myTasks = currentEmployee
    ? tasks.filter((t) => t.assigneeId === currentEmployee.id)
    : [];
  const myLeaveRequests = currentEmployee
    ? leaveRequests.filter((lr) => lr.employeeId === currentEmployee.id)
    : [];

  // Get employee's projects
  const myProjects = currentEmployee
    ? projects.filter(p => {
        // Check if employee is assigned to this project through tasks
        return tasks.some(t => t.projectId === p.id && t.assigneeId === currentEmployee.id);
      })
    : [];

  const projectCount = myProjects.length;
  const enrollmentStatus = projectCount === 0 ? 'Not Enrolled' : projectCount === 1 ? 'Single Project' : 'Multiple Projects';

  const inProgressTasks = myTasks.filter(
    (t) => t.status === 'In Progress'
  ).length;
  const completedTasks = myTasks.filter((t) => t.status === 'Done').length;

  const statusColors: Record<string, string> = {
    Approved: 'text-green-400 bg-green-900/20 border-green-400/20',
    Pending: 'text-yellow-400 bg-yellow-900/20 border-yellow-400/20',
    Rejected: 'text-red-400 bg-red-900/20 border-red-400/20',
  };

  return (
    <>
      <PageHeader
        title="My Dashboard"
        description="Your personal space to track tasks and leave."
      >
        {/* Wall Clock in Top Right */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-xl">
            <div className="text-center">
              <div className="text-xl font-bold tabular-nums">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                })}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {currentTime.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="relative transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks In Progress</CardTitle>
            <ListTodo className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">Keep up the great work</p>
          </CardContent>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8">
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Card>
        <Card className="relative transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">+{completedTasks}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8">
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Card>
        <Card className="relative transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
            <CalendarCheck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{myLeaveRequests.length}</div>
            <p className="text-xs text-muted-foreground">Total requests submitted</p>
          </CardContent>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8">
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Card>
        <Card className="relative transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Projects</CardTitle>
            <FolderKanban className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{projectCount}</div>
            <p className="text-xs text-muted-foreground">{enrollmentStatus}</p>
          </CardContent>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8">
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Card>
      </div>

      {/* Projects Section */}
      {myProjects.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>My Projects</CardTitle>
            <CardDescription>Projects you're currently working on</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {myProjects.map((project) => {
                const projectTasks = myTasks.filter(t => t.projectId === project.id);
                const completedProjectTasks = projectTasks.filter(t => t.status === 'Done').length;
                const totalProjectTasks = projectTasks.length;
                const taskProgress = totalProjectTasks > 0 ? (completedProjectTasks / totalProjectTasks) * 100 : 0;

                return (
                  <Card key={project.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {totalProjectTasks} task{totalProjectTasks !== 1 ? 's' : ''} assigned
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className={cn(
                          project.status === 'On Track' && 'bg-green-900/20 text-green-400 border-green-400/20',
                          project.status === 'At Risk' && 'bg-yellow-900/20 text-yellow-400 border-yellow-400/20',
                          project.status === 'Completed' && 'bg-blue-900/20 text-blue-400 border-blue-400/20'
                        )}>
                          {project.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Your Progress</span>
                          <span className="font-medium">{Math.round(taskProgress)}%</span>
                        </div>
                        <Progress value={taskProgress} className="h-2" />
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {completedProjectTasks}/{totalProjectTasks} completed
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card className="relative transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks In Progress</CardTitle>
            <ListTodo className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">Keep up the great work</p>
          </CardContent>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8">
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Card>
        <Card className="relative transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">+{completedTasks}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8">
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Card>
        <Card className="relative transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
            <CalendarCheck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{myLeaveRequests.length}</div>
            <p className="text-xs text-muted-foreground">Total requests submitted</p>
          </CardContent>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8">
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
            <CardDescription>Tasks assigned to you across all projects.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myTasks.slice(0, 5).map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{task.projectId}</TableCell>
                    <TableCell>
                      <Badge
                        variant={task.status === 'Done' ? 'default' : 'secondary'}
                        className={cn(
                          task.status === 'In Progress' && 'bg-yellow-900/50 text-yellow-300 border-yellow-400/20',
                          task.status === 'Done' && 'bg-green-900/50 text-green-300 border-green-400/20',
                          task.status === 'To Do' && 'bg-red-900/50 text-red-300 border-red-400/20'
                        )}
                      >
                        {task.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My Leave Requests</CardTitle>
            <CardDescription>A summary of your past and pending leave requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myLeaveRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {new Date(request.startDate).toLocaleDateString()} -{' '}
                      {new Date(request.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("font-medium", statusColors[request.status])}
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
