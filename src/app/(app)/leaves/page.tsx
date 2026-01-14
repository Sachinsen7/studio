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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { employees, leaveRequests as initialLeaveRequests, type LeaveRequest } from '@/lib/data';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';

const statusConfig = {
    Pending: { color: 'bg-yellow-900/20 text-yellow-400 border-yellow-400/20', icon: Clock },
    Approved: { color: 'bg-green-900/20 text-green-400 border-green-400/20', icon: CheckCircle },
    Rejected: { color: 'bg-red-900/20 text-red-400 border-red-400/20', icon: XCircle },
};

type ExtendedLeaveRequest = LeaveRequest & {
    adminComment?: string;
};

export default function LeavesPage() {
    const [leaveRequests, setLeaveRequests] = React.useState<ExtendedLeaveRequest[]>(initialLeaveRequests);
    const [filterStatus, setFilterStatus] = React.useState<string>('all');
    const [selectedRequest, setSelectedRequest] = React.useState<ExtendedLeaveRequest | null>(null);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [actionType, setActionType] = React.useState<'approve' | 'reject'>('approve');
    const [comment, setComment] = React.useState('');
    const { toast } = useToast();

    const filteredRequests = leaveRequests.filter(
        (req) => filterStatus === 'all' || req.status === filterStatus
    );

    const openDialog = (request: ExtendedLeaveRequest, action: 'approve' | 'reject') => {
        setSelectedRequest(request);
        setActionType(action);
        setComment('');
        setDialogOpen(true);
    };

    const handleStatusChange = () => {
        if (!selectedRequest) return;

        const newStatus = actionType === 'approve' ? 'Approved' : 'Rejected';
        
        setLeaveRequests((prev) =>
            prev.map((req) => 
                req.id === selectedRequest.id 
                    ? { ...req, status: newStatus, adminComment: comment || undefined } 
                    : req
            )
        );
        
        toast({
            title: `Leave Request ${newStatus}`,
            description: `The leave request has been ${newStatus.toLowerCase()}.`,
        });

        setDialogOpen(false);
        setSelectedRequest(null);
        setComment('');
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
                                <TableHead>Leave Type</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Reason</TableHead>
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
                                        <TableCell>
                                            <Badge variant="outline">Casual</Badge>
                                        </TableCell>
                                        <TableCell>{startDate.toLocaleDateString()}</TableCell>
                                        <TableCell>{endDate.toLocaleDateString()}</TableCell>
                                        <TableCell>{duration} day{duration > 1 ? 's' : ''}</TableCell>
                                        <TableCell className="max-w-[200px]">
                                            <p className="text-sm text-muted-foreground truncate">
                                                Personal reasons
                                            </p>
                                        </TableCell>
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
                                                        onClick={() => openDialog(request, 'approve')}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                                        onClick={() => openDialog(request, 'reject')}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground">
                                                        {request.status}
                                                    </span>
                                                    {request.adminComment && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            title={request.adminComment}
                                                        >
                                                            <MessageSquare className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Approval/Rejection Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request
                        </DialogTitle>
                        <DialogDescription>
                            {selectedRequest && (
                                <>
                                    Leave request from {getEmployee(selectedRequest.employeeId)?.name} for{' '}
                                    {new Date(selectedRequest.startDate).toLocaleDateString()} to{' '}
                                    {new Date(selectedRequest.endDate).toLocaleDateString()}
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="comment">Comment (Optional)</Label>
                            <Textarea
                                id="comment"
                                placeholder={`Add a comment for the ${actionType === 'approve' ? 'approval' : 'rejection'}...`}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleStatusChange}
                                className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                            >
                                {actionType === 'approve' ? 'Approve' : 'Reject'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
