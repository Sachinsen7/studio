'use client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ListTodo, CheckCircle2, CalendarCheck, LogOut } from 'lucide-react';
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
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (role && role !== 'employee') {
     router.replace('/dashboard');
     return (
        <div className="flex h-screen items-center justify-center">
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
    Approved: 'text-green-700 bg-green-50 border-green-200',
    Pending: 'text-amber-700 bg-amber-50 border-amber-200',
    Rejected: 'text-red-700 bg-red-50 border-red-200',
  };

  return (
    <div className='min-h-screen bg-background'>
      <header className="flex h-16 items-center justify-between gap-4 border-b bg-card px-6">
        <div className="flex items-center gap-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
              <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid">
              <span className="font-semibold">{user.displayName}</span>
              <span className="text-sm text-muted-foreground">{user.email}</span>
            </div>
        </div>
        <Button onClick={signOut} variant="outline">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </header>
      <main className="p-4 sm:p-6">
        <PageHeader
          title="My Dashboard"
          description="Your personal space to track tasks and leave."
        />
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks In Progress</CardTitle>
              <ListTodo className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressTasks}</div>
              <p className="text-xs text-muted-foreground">Keep up the great work</p>
            </CardContent>
          </Card>
          <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{completedTasks}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card className="transition-all hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myLeaveRequests.length}</div>
              <p className="text-xs text-muted-foreground">Total requests submitted</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Tasks</CardTitle>
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
                          className={task.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : ''}
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
                          className={statusColors[request.status]}
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
