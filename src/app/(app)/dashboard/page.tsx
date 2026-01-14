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
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { projects, employees, tasks } from '@/lib/data';
import { ProjectStatusChart } from '@/components/charts/project-status-chart';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const totalEmployees = employees.length;
  const totalProjects = projects.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;

  // Project statistics
  const onTrackProjects = projects.filter(p => p.status === 'On Track').length;
  const atRiskProjects = projects.filter(p => p.status === 'At Risk').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;

  // Employee enrollment statistics
  const employeeProjectCounts = employees.map(emp => {
    const projectCount = tasks
      .filter(t => t.assigneeId === emp.id)
      .map(t => t.projectId)
      .filter((value, index, self) => self.indexOf(value) === index)
      .length;
    return { ...emp, projectCount };
  });

  const notEnrolled = employeeProjectCounts.filter(e => e.projectCount === 0).length;
  const singleProject = employeeProjectCounts.filter(e => e.projectCount === 1).length;
  const multipleProjects = employeeProjectCounts.filter(e => e.projectCount > 1).length;

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
            <div className="text-4xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">+2 since last month</p>
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
            <div className="text-4xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">1 project completed</p>
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
            <div className="text-4xl font-bold">{inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">3 tasks newly assigned</p>
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
            <p className="text-xs text-muted-foreground">+10 since last week</p>
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
                  <p className="text-xs text-muted-foreground">{Math.round((onTrackProjects / totalProjects) * 100)}% of total</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-400">{onTrackProjects}</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-900/10 rounded-lg border border-yellow-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-900/20 rounded">
                  <Activity className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">At Risk</p>
                  <p className="text-xs text-muted-foreground">{Math.round((atRiskProjects / totalProjects) * 100)}% of total</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-yellow-400">{atRiskProjects}</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-900/10 rounded-lg border border-blue-900/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-900/20 rounded">
                  <FolderKanban className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Completed</p>
                  <p className="text-xs text-muted-foreground">{Math.round((completedProjects / totalProjects) * 100)}% of total</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-400">{completedProjects}</div>
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
              <div className="text-2xl font-bold">{notEnrolled}</div>
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
              <div className="text-2xl font-bold">{singleProject}</div>
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
              <div className="text-2xl font-bold">{multipleProjects}</div>
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
              {employeeProjectCounts
                .sort((a, b) => b.projectCount - a.projectCount)
                .slice(0, 5)
                .map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between p-2 hover:bg-accent rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={emp.avatarUrl} alt={emp.name} />
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
          <ProjectStatusChart projects={projects} />
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
             {employees.slice(1, 5).map((employee) => (
                <div key={employee.id} className="flex items-start gap-4">
                    <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                        <AvatarImage src={employee.avatarUrl} alt={employee.name} />
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
