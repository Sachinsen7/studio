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

export default function DashboardPage() {
  const totalEmployees = employees.length;
  const totalProjects = projects.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;

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
