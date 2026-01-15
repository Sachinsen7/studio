'use client';
import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ListTodo, CheckCircle2, CalendarCheck, ArrowUpRight, FolderKanban, Clock, LoaderCircle } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
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

type Task = {
  id: string;
  title: string;
  status: string;
  projectId: string;
  project?: { id: string; name: string };
};

type LeaveRequest = {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
};

type Project = {
  id: string;
  name: string;
  status: string;
  progress: number;
};

export default function EmployeeDashboardPage() {
  const auth = useAuth();
  const { user } = useUser(auth);
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [loading, setLoading] = React.useState(true);
  const [employeeId, setEmployeeId] = React.useState<string | null>(null);
  const [myTasks, setMyTasks] = React.useState<Task[]>([]);
  const [myLeaveRequests, setMyLeaveRequests] = React.useState<LeaveRequest[]>([]);
  const [myProjects, setMyProjects] = React.useState<Project[]>([]);

  // Update clock every second
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch employee data
  React.useEffect(() => {
    const fetchData = async () => {
      if (!user?.email) return;
      try {
        // Use the new /me endpoint for better performance
        const empRes = await fetch(`/api/employees/me?email=${encodeURIComponent(user.email)}`);
        if (!empRes.ok) {
          console.error('Failed to fetch employee');
          setLoading(false);
          return;
        }
        
        const currentEmployee = await empRes.json();
        console.log('Current employee:', currentEmployee);

        if (currentEmployee?.id) {
          setEmployeeId(currentEmployee.id);

          // Fetch leave requests and projects in parallel
          const [leavesRes, projectsRes] = await Promise.all([
            fetch(`/api/leave-requests?employeeId=${currentEmployee.id}`),
            fetch('/api/projects')
          ]);

          // Process tasks from employee data (already included)
          const tasks = Array.isArray(currentEmployee.tasks) ? currentEmployee.tasks : [];
          setMyTasks(tasks);

          // Process projects - show both projects from tasks AND the assigned project
          if (projectsRes.ok) {
            const allProjects = await projectsRes.json();
            if (Array.isArray(allProjects)) {
              // Get project IDs from tasks
              const projectIdsFromTasks = [...new Set(tasks.map((t: Task) => t?.projectId).filter(Boolean))];
              
              console.log('Employee project:', currentEmployee.project);
              console.log('All projects:', allProjects.map(p => ({ id: p.id, name: p.name })));
              console.log('Project IDs from tasks:', projectIdsFromTasks);
              
              // Filter projects: either from tasks OR matching employee's assigned project name
              const employeeProjects = allProjects.filter((p: Project) => {
                if (!p?.id) return false;
                // Include if project ID matches task projectId
                if (projectIdsFromTasks.includes(p.id)) return true;
                // Include if project name matches employee's assigned project
                if (currentEmployee.project && p.name === currentEmployee.project) return true;
                return false;
              });
              
              console.log('Filtered employee projects:', employeeProjects.map(p => ({ id: p.id, name: p.name })));
              setMyProjects(employeeProjects);
            }
          }

          // Process leave requests
          if (leavesRes.ok) {
            const leavesData = await leavesRes.json();
            setMyLeaveRequests(Array.isArray(leavesData) ? leavesData : []);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.email]);

  const projectCount = myProjects?.length || 0;
  const enrollmentStatus = projectCount === 0 ? 'Not Enrolled' : projectCount === 1 ? 'Single Project' : 'Multiple Projects';

  const inProgressTasks = (myTasks || []).filter(t => t?.status === 'InProgress').length;
  const completedTasks = (myTasks || []).filter(t => t?.status === 'Done').length;

  const statusColors: Record<string, string> = {
    Approved: 'text-green-400 bg-green-900/20 border-green-400/20',
    Pending: 'text-yellow-400 bg-yellow-900/20 border-yellow-400/20',
    Rejected: 'text-red-400 bg-red-900/20 border-red-400/20',
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
            <div className="text-4xl font-bold">{myLeaveRequests?.length || 0}</div>
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
      {myProjects && myProjects.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>My Projects</CardTitle>
            <CardDescription>Projects you're currently working on</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {myProjects.map((project) => {
                if (!project?.id) return null;
                const projectTasks = (myTasks || []).filter(t => t?.projectId === project.id);
                const completedProjectTasks = projectTasks.filter(t => t?.status === 'Done').length;
                const totalProjectTasks = projectTasks.length;
                const taskProgress = totalProjectTasks > 0 ? (completedProjectTasks / totalProjectTasks) * 100 : 0;

                return (
                  <Card key={project.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{project.name || 'Unnamed Project'}</CardTitle>
                          <CardDescription className="text-xs mt-1">
                            {projectTasks.length} task{projectTasks.length !== 1 ? 's' : ''} assigned
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className={cn(
                          project.status === 'OnTrack' && 'bg-green-900/20 text-green-400 border-green-400/20',
                          project.status === 'AtRisk' && 'bg-yellow-900/20 text-yellow-400 border-yellow-400/20',
                          project.status === 'Completed' && 'bg-blue-900/20 text-blue-400 border-blue-400/20'
                        )}>
                          {project.status === 'OnTrack' ? 'On Track' : project.status === 'AtRisk' ? 'At Risk' : 'Completed'}
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
                {(myTasks || []).slice(0, 5).map((task) => {
                  if (!task?.id) return null;
                  return (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title || 'Untitled Task'}</TableCell>
                      <TableCell>{task.project?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={task.status === 'Done' ? 'default' : 'secondary'}
                          className={cn(
                            task.status === 'InProgress' && 'bg-yellow-900/50 text-yellow-300 border-yellow-400/20',
                            task.status === 'Done' && 'bg-green-900/50 text-green-300 border-green-400/20',
                            task.status === 'ToDo' && 'bg-red-900/50 text-red-300 border-red-400/20'
                          )}
                        >
                          {task.status === 'InProgress' ? 'In Progress' : task.status === 'ToDo' ? 'To Do' : 'Done'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!myTasks || myTasks.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No tasks assigned yet
                    </TableCell>
                  </TableRow>
                )}
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
                {(myLeaveRequests || []).map((request) => {
                  if (!request?.id) return null;
                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        {request.startDate ? new Date(request.startDate).toLocaleDateString() : 'N/A'} -{' '}
                        {request.endDate ? new Date(request.endDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("font-medium", statusColors[request.status] || statusColors.Pending)}
                        >
                          {request.status || 'Pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {(!myLeaveRequests || myLeaveRequests.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                      No leave requests yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
