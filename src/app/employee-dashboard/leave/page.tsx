'use client';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
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
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { leaveRequests, employees } from '@/lib/data';

export default function EmployeeLeavePage() {
    const auth = useAuth();
    const { user } = useUser(auth);

    const currentEmployee = user ? employees.find(e => e.email === user.email) : null;
    const myLeaveRequests = currentEmployee
        ? leaveRequests.filter((lr) => lr.employeeId === currentEmployee.id)
        : [];

    const statusColors: Record<string, string> = {
        Approved: 'text-green-400 bg-green-900/20 border-green-400/20',
        Pending: 'text-yellow-400 bg-yellow-900/20 border-yellow-400/20',
        Rejected: 'text-red-400 bg-red-900/20 border-red-400/20',
    };

    return (
        <>
            <PageHeader
                title="Leave Requests"
                description="Submit and track your leave requests."
            />
            <div className="grid gap-6 md:grid-cols-3 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-400">
                            {myLeaveRequests.filter(r => r.status === 'Approved').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-400">
                            {myLeaveRequests.filter(r => r.status === 'Pending').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-400">
                            {myLeaveRequests.filter(r => r.status === 'Rejected').length}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>My Leave Requests</CardTitle>
                        <CardDescription>View and manage your leave requests.</CardDescription>
                    </div>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Request Leave
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {myLeaveRequests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell className="font-medium">
                                        {new Date(request.startDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(request.endDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>Personal</TableCell>
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
                            {myLeaveRequests.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        No leave requests found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}
