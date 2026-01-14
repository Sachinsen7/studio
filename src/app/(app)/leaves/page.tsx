'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { employees, leaveRequests as initialLeaveRequests, type LeaveRequest } from '@/lib/data';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const statusConfig = {
    Pending: { color: 'bg-yellow-900/20 text-yellow-400 border-yellow-400/20', icon: Clock },
    Approved: { color: 'bg-green-900/20 text-green-400 border-green-400/20', icon: CheckCircle },
    Rejected: { color: 'bg-red-900/20 text-red-400 border-red-400/20', icon: XCircle },
};

export default function LeavesPage() {
    const [leaveRequests, setLeaveRequests] = React.useState<LeaveRequest[]>(initialLeaveRequests);
    const [filterStatus, setFilterStatus] = React.useState<string>('all');
    const { toast } = useToast();

    const filteredRequests = leaveRequests.filter(
        (req) => filterStatus === 'all' || req.status === filterStatus
    );

    const handleStatusChange = (requestId: string, newStatus: LeaveRequest['status']) => {
        setLeaveRequests((prev) =>
            prev.map((req) => (req.id === requestId ? { ...req, status: newStatus } : req))
        );
        toast({
            title: `Leave Request ${newStatus}`,
            description: `The leave request has been ${newStatus.toLowerCase()}.`,
        });
    };

    const getEmployee = (employeeId: string) => employees.find((e) => e.id === employeeId);

    return (
        <>
            <PageHeader
                title="Leave Management"
                description="Review and manage employee leave requests."
            />

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-900/20 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {leaveRequests.filter((r) => r.status === 'Pending').length}
                                </p>
                                <p className="text-sm text-muted-foreground">Pending Requests</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-900/20 rounded-lg">
                                <CheckCircle className="h-6 w-6 text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {leaveRequests.filter((r) => r.status === 'Approved').length}
                                </p>
                                <p className="text-sm text-muted-foreground">Approved</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-900/20 rounded-lg">
                                <XCircle className="h-6 w-6 text-red-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {leaveRequests.filter((r) => r.status === 'Rejected').length}
                                </p>
                                <p className="text-sm text-muted-foreground">Rejected</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter */}
            <div className="mb-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Requests</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRequests.map((request) => {
                                const employee = getEmployee(request.employeeId);
                                const startDate = new Date(request.startDate);
                                const endDate = new Date(request.endDate);
                                const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                                const StatusIcon = statusConfig[request.status].icon;

                                return (
                                    <TableRow key={request.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={employee?.avatarUrl} alt={employee?.name} />
                                                    <AvatarFallback>{employee?.name?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{employee?.name}</p>
                                                    <p className="text-sm text-muted-foreground">{employee?.role}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{startDate.toLocaleDateString()}</TableCell>
                                        <TableCell>{endDate.toLocaleDateString()}</TableCell>
                                        <TableCell>{duration} day{duration > 1 ? 's' : ''}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={statusConfig[request.status].color}>
                                                <StatusIcon className="h-3 w-3 mr-1" />
                                                {request.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {request.status === 'Pending' ? (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
                                                        onClick={() => handleStatusChange(request.id, 'Approved')}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                        onClick={() => handleStatusChange(request.id, 'Rejected')}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">No actions</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}
