'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ListTodo, CheckCircle2, CalendarCheck, LogOut, Activity, ArrowUpRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { tasks, leaveRequests, employees } from '@/lib/data';
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
import { useAuth } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import React from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EmployeeDashboardPage() {
  const auth = useAuth();
  const { user, loading, signOut, role } = useUser(auth);
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!loading && role && role !== 'employee') {
     router.replace('/dashboard');
     return (
        <div className="flex h-screen items-center justify-center bg-background">
          <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        </div>
     );
  }

  // Find the current employee from mock data
  const currentEmployee = employees.find(e => e.email === user.email);

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
    <div className='min-h-screen bg-background text-foreground'>
      <header className="flex h-16 items-center justify-between gap-4 border-b border-border px-6">
        <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.photoURL ?? currentEmployee?.avatarUrl} alt={user.displayName ?? ''} />
              <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <span className="font-semibold">{currentEmployee?.name ?? user.displayName}</span>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
        </div>
        <Button onClick={signOut} variant="outline">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </header>
      <main className="p-6">
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
      </main>
    </div>
  );
}
