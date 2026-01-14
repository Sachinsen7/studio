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
import { Clock } from 'lucide-react';

// Mock attendance data for the employee
const mockAttendance = [
    { id: '1', date: '2026-01-13', checkIn: '09:00', checkOut: '18:00', status: 'Present' },
    { id: '2', date: '2026-01-12', checkIn: '09:15', checkOut: '17:45', status: 'Present' },
    { id: '3', date: '2026-01-11', checkIn: null, checkOut: null, status: 'Absent' },
    { id: '4', date: '2026-01-10', checkIn: '08:45', checkOut: '18:30', status: 'Present' },
    { id: '5', date: '2026-01-09', checkIn: '09:30', checkOut: '17:00', status: 'Late' },
];

export default function EmployeeAttendancePage() {
    const auth = useAuth();
    const { user } = useUser(auth);

    const statusColors: Record<string, string> = {
        Present: 'text-green-400 bg-green-900/20 border-green-400/20',
        Absent: 'text-red-400 bg-red-900/20 border-red-400/20',
        Late: 'text-yellow-400 bg-yellow-900/20 border-yellow-400/20',
    };

    return (
        <>
            <PageHeader
                title="My Attendance"
                description="View your attendance history and check in/out."
            />
            <div className="grid gap-6 md:grid-cols-3 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Present Days</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-400">
                            {mockAttendance.filter(a => a.status === 'Present').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Late Days</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-400">
                            {mockAttendance.filter(a => a.status === 'Late').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-400">
                            {mockAttendance.filter(a => a.status === 'Absent').length}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Attendance History</CardTitle>
                        <CardDescription>Your recent attendance records.</CardDescription>
                    </div>
                    <Button>
                        <Clock className="mr-2 h-4 w-4" />
                        Check In
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Check In</TableHead>
                                <TableHead>Check Out</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockAttendance.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium">
                                        {new Date(record.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>{record.checkIn ?? '-'}</TableCell>
                                    <TableCell>{record.checkOut ?? '-'}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={cn("font-medium", statusColors[record.status])}
                                        >
                                            {record.status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}
