'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { PlusCircle, Calendar, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type LeaveRequest = {
    id: string;
    startDate: string;
    endDate: string;
    leaveType: string;
    leaveDuration: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    adminComment?: string;
    createdAt: string;
};

const statusConfig = {
    Pending: { color: 'bg-yellow-900/20 text-yellow-400 border-yellow-400/20', icon: Clock },
    Approved: { color: 'bg-green-900/20 text-green-400 border-green-400/20', icon: CheckCircle },
    Rejected: { color: 'bg-red-900/20 text-red-400 border-red-400/20', icon: XCircle },
};

const leaveTypes = ['Casual', 'Sick', 'Earned', 'Unpaid', 'Maternity', 'Paternity'];
const leaveDurations = ['FullDay', 'HalfDay', 'FirstHalf', 'SecondHalf'];

export default function MyLeavesPage() {
    const auth = useAuth();
    const { user } = useUser(auth);
    const { toast } = useToast();
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [leaveRequests, setLeaveRequests] = React.useState<LeaveRequest[]>([
        {
            id: '1',
            startDate: '2026-01-20',
            endDate: '2026-01-22',
            leaveType: 'Casual',
            leaveDuration: 'FullDay',
            reason: 'Family function',
            status: 'Pending',
            createdAt: '2026-01-10',
        },
        {
            id: '2',
            startDate: '2025-12-24',
            endDate: '2025-12-26',
            leaveType: 'Earned',
            leaveDuration: 'FullDay',
            reason: 'Christmas vacation',
            status: 'Approved',
            adminComment: 'Approved. Enjoy your holidays!',
            createdAt: '2025-12-01',
        },
        {
            id: '3',
            startDate: '2025-11-15',
            endDate: '2025-11-15',
            leaveType: 'Sick',
            leaveDuration: 'HalfDay',
            reason: 'Medical appointment',
            status: 'Rejected',
            adminComment: 'Please reschedule to a less busy period.',
            createdAt: '2025-11-10',
        },
    ]);

    const [formData, setFormData] = React.useState({
        startDate: '',
        endDate: '',
        leaveType: 'Casual',
        leaveDuration: 'FullDay',
        reason: '',
    });

    // Calculate leave balance (mock data)
    const leaveBalance = {
        casual: { total: 12, used: 3, remaining: 9 },
        sick: { total: 10, used: 1, remaining: 9 },
        earned: { total: 15, used: 5, remaining: 10 },
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate dates
            if (new Date(formData.startDate) > new Date(formData.endDate)) {
                toast({
                    title: 'Invalid Dates',
                    description: 'End date must be after start date',
                    variant: 'destructive',
                });
                return;
            }

            const newRequest: LeaveRequest = {
                id: Date.now().toString(),
                ...formData,
                status: 'Pending',
                createdAt: new Date().toISOString(),
            };

            setLeaveRequests(prev => [newRequest, ...prev]);
            
            toast({
                title: 'Leave Request Submitted',
                description: 'Your leave request has been submitted for approval.',
            });

            setOpen(false);
            setFormData({
                startDate: '',
                endDate: '',
                leaveType: 'Casual',
                leaveDuration: 'FullDay',
                reason: '',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to submit leave request',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        setLeaveRequests(prev => prev.filter(req => req.id !== id));
        toast({
            title: 'Request Deleted',
            description: 'Leave request has been deleted.',
        });
    };

    const calculateDuration = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return days;
    };

    const stats = React.useMemo(() => {
        return {
            pending: leaveRequests.filter(r => r.status === 'Pending').length,
            approved: leaveRequests.filter(r => r.status === 'Approved').length,
            rejected: leaveRequests.filter(r => r.status === 'Rejected').length,
        };
    }, [leaveRequests]);

    return (
        <>
            <PageHeader
                title="My Leave Requests"
                description="Apply for leave and track your leave balance."
            >
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Apply for Leave
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Apply for Leave</DialogTitle>
                            <DialogDescription>
                                Fill in the details below to submit your leave request.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="leaveType">Leave Type</Label>
                                <Select
                                    value={formData.leaveType}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, leaveType: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leaveTypes.map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="leaveDuration">Duration</Label>
                                <Select
                                    value={formData.leaveDuration}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, leaveDuration: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FullDay">Full Day</SelectItem>
                                        <SelectItem value="HalfDay">Half Day</SelectItem>
                                        <SelectItem value="FirstHalf">First Half</SelectItem>
                                        <SelectItem value="SecondHalf">Second Half</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason</Label>
                                <Textarea
                                    id="reason"
                                    placeholder="Please provide a reason for your leave..."
                                    value={formData.reason}
                                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                    required
                                    rows={4}
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Submitting...' : 'Submit Request'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </PageHeader>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-900/20 rounded-lg">
                                <Clock className="h-6 w-6 text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{stats.pending}</p>
                                <p className="text-sm text-muted-foreground">Pending</p>
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
                                <p className="text-2xl font-bold">{stats.approved}</p>
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
                                <p className="text-2xl font-bold">{stats.rejected}</p>
                                <p className="text-sm text-muted-foreground">Rejected</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-900/20 rounded-lg">
                                <Calendar className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{leaveRequests.length}</p>
                                <p className="text-sm text-muted-foreground">Total Requests</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-6">
                {/* Leave Balance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Leave Balance</CardTitle>
                        <CardDescription>Your available leave days</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Casual Leave</span>
                                <span className="font-medium">{leaveBalance.casual.remaining}/{leaveBalance.casual.total}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500" 
                                    style={{ width: `${(leaveBalance.casual.remaining / leaveBalance.casual.total) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Sick Leave</span>
                                <span className="font-medium">{leaveBalance.sick.remaining}/{leaveBalance.sick.total}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-green-500" 
                                    style={{ width: `${(leaveBalance.sick.remaining / leaveBalance.sick.total) * 100}%` }}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Earned Leave</span>
                                <span className="font-medium">{leaveBalance.earned.remaining}/{leaveBalance.earned.total}</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-purple-500" 
                                    style={{ width: `${(leaveBalance.earned.remaining / leaveBalance.earned.total) * 100}%` }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Leave Requests Table */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Leave Request History</CardTitle>
                        <CardDescription>View all your leave requests and their status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Dates</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Days</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaveRequests.map((request) => {
                                    const StatusIcon = statusConfig[request.status].icon;
                                    const duration = calculateDuration(request.startDate, request.endDate);
                                    
                                    return (
                                        <TableRow key={request.id}>
                                            <TableCell>
                                                <div className="text-sm">
                                                    <div className="font-medium">
                                                        {new Date(request.startDate).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-muted-foreground">
                                                        to {new Date(request.endDate).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{request.leaveType}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-xs">
                                                    {request.leaveDuration === 'FullDay' ? 'Full Day' :
                                                     request.leaveDuration === 'HalfDay' ? 'Half Day' :
                                                     request.leaveDuration === 'FirstHalf' ? 'First Half' :
                                                     'Second Half'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{duration} day{duration > 1 ? 's' : ''}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn('text-xs', statusConfig[request.status].color)}>
                                                    <StatusIcon className="h-3 w-3 mr-1" />
                                                    {request.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {request.status === 'Pending' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                        onClick={() => handleDelete(request.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Admin Comments Section */}
            {leaveRequests.some(r => r.adminComment) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Admin Comments</CardTitle>
                        <CardDescription>Feedback from your manager</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {leaveRequests
                            .filter(r => r.adminComment)
                            .map(request => (
                                <div key={request.id} className="p-4 border rounded-lg">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="text-sm font-medium">
                                            {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                                        </div>
                                        <Badge variant="outline" className={cn('text-xs', statusConfig[request.status].color)}>
                                            {request.status}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{request.adminComment}</p>
                                </div>
                            ))}
                    </CardContent>
                </Card>
            )}
        </>
    );
}
