'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ListTodo, CheckCircle2, CalendarCheck, ArrowUpRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { tasks, leaveRequests, employees } from '@/lib/data';
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

export default function EmployeeDashboardPage() {
  const auth = useAuth();
  const { user } = useUser(auth);

  // Find the current employee from mock data
  const currentEmployee = user ? employees.find(e => e.email === user.email) : null;

  const myTasks = currentEmployee
    ? tasks.filter((t) => t.assigneeId === currentEmployee.id)
    : [];
  const myLeaveRequests = currentEmployee
    ? leaveRequests.filter((lr) => lr.employeeId === currentEmployee.id)
    : [];

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
      />
      <div className="grid gap-6 md:grid-cols-3">
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
