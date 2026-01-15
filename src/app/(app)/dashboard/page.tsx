'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ListTodo,
  Users,
  Building2,
  CheckCircle2,
  Activity,
  ArrowUpRight,
  FolderKanban,
  UserCheck,
  LoaderCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { ProjectStatusChart } from '@/components/charts/project-status-chart';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DashboardStats = {
  totalEmployees: number;
  totalProjects: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  onTrackProjects: number;
  atRiskProjects: number;
  completedProjects: number;
  notEnrolled: number;
  singleProject: number;
  multipleProjects: number;
  topContributors: Array<{
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    role: string;
    projectCount: number;
  }>;
};

type Project = {
  id: string;
  name: string;
  status: string;
  progress: number;
};

type Employee = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  project: string;
};

export default function DashboardPage() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [recentEmployees, setRecentEmployees] = React.useState<Employee[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projectsRes, employeesRes] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/projects'),
          fetch('/api/employees'),
        ]);

        const statsData = await statsRes.json();
        const projectsData = await projectsRes.json();
        const employeesData = await employeesRes.json();

        setStats(statsData);
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setRecentEmployees(Array.isArray(employeesData) ? employeesData.slice(0, 4) : []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Here's a high-level overview of ADRS activities."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative transition-all hover:shadow-lg hover:-translate-y-1">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
           <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8">
                <ArrowUpRight className="h-4 w-4" />
            </Button>
        </Card>
        <Card className="relative transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">{stats.completedProjects} completed</p>
          </CardContent>
           <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8">
                <ArrowUpRight className="h-4 w-4" />
            </Button>
        </Card>
        <Card className="relative transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks In Progress</CardTitle>
            <ListTodo className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">{stats.todoTasks} pending</p>
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
            <div className="text-4xl font-bold">+{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">Successfully finished</p>
          </CardContent>
           <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8">
                <ArrowUpRight className="h-4 w-4" />
            </Button>
        </Card>
      </div>

      {/* Project Statistics Section */}
      <div className="grid gap-6 md:grid-cols-3 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Project Status Breakdown</CardTitle>
            <CardDescription>Distribution of projects by status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-900/10 rounded-lg border border-green-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-900/20 rounded">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">On Track</p>
                  <p className="text-xs text-muted-foreground">{stats.totalProjects > 0 ? Math.round((stats.onTrackProjects / stats.totalProjects) * 100) : 0}% of total</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-400">{stats.onTrackProjects}</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-900/10 rounded-lg border border-yellow-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-900/20 rounded">
                  <Activity className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">At Risk</p>
                  <p className="text-xs text-muted-foreground">{stats.totalProjects > 0 ? Math.round((stats.atRiskProjects / stats.totalProjects) * 100) : 0}% of total</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-yellow-400">{stats.atRiskProjects}</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-900/10 rounded-lg border border-blue-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-900/20 rounded">
                  <FolderKanban className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Completed</p>
                  <p className="text-xs text-muted-foreground">{stats.totalProjects > 0 ? Math.round((stats.completedProjects / stats.totalProjects) * 100) : 0}% of total</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-400">{stats.completedProjects}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Employee Enrollment</CardTitle>
            <CardDescription>Project assignment distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-900/20 rounded">
                  <Users className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Not Enrolled</p>
                  <p className="text-xs text-muted-foreground">No project assigned</p>
                </div>
              </div>
              <div className="text-2xl font-bold">{stats.notEnrolled}</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-900/20 rounded">
                  <UserCheck className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Single Project</p>
                  <p className="text-xs text-muted-foreground">One project assigned</p>
                </div>
              </div>
              <div className="text-2xl font-bold">{stats.singleProject}</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-900/20 rounded">
                  <FolderKanban className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Multiple Projects</p>
                  <p className="text-xs text-muted-foreground">2+ projects assigned</p>
                </div>
              </div>
              <div className="text-2xl font-bold">{stats.multipleProjects}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Contributors</CardTitle>
            <CardDescription>Employees with most projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topContributors.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between p-2 hover:bg-accent rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={emp.avatarUrl || undefined} alt={emp.name} />
                      <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.role}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className={cn(
                    emp.projectCount === 0 && 'bg-red-900/20 text-red-400',
                    emp.projectCount === 1 && 'bg-blue-900/20 text-blue-400',
                    emp.projectCount > 1 && 'bg-green-900/20 text-green-400'
                  )}>
                    {emp.projectCount} {emp.projectCount === 1 ? 'project' : 'projects'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-5 mt-6">
        <div className="md:col-span-3">
          <ProjectStatusChart projects={projects.map(p => ({
            ...p,
            status: p.status === 'OnTrack' ? 'On Track' : p.status === 'AtRisk' ? 'At Risk' : 'Completed'
          }))} />
        </div>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity />
              Recent Team Activity
            </CardTitle>
            <CardDescription>An overview of recent project activities and updates from the team.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {recentEmployees.map((employee) => (
                <div key={employee.id} className="flex items-start gap-4">
                    <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                        <AvatarImage src={employee.avatarUrl || undefined} alt={employee.name} />
                        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                            <span className="font-bold">{employee.name}</span> completed a task in <span className="text-primary">{employee.project}</span>.
                        </p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
