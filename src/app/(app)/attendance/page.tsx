'use client'
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { employees, leaveRequests, attendance } from '@/lib/data';
import { PlusCircle, Check, X } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { cn } from '@/lib/utils';
import type { DayPicker } from 'react-day-picker';

const statusColors: Record<string, string> = {
  Approved: 'text-green-400 bg-green-900/20 border-green-400/20',
  Pending: 'text-yellow-400 bg-yellow-900/20 border-yellow-400/20',
  Rejected: 'text-red-400 bg-red-900/20 border-red-400/20',
};

export default function AttendancePage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  const onLeaveDays = attendance
    .filter(a => a.status === 'On Leave')
    .map(a => a.date);

  const modifiers: DayPicker['modifiers'] = {
    onLeave: onLeaveDays,
  };
  
  const modifiersClassNames: DayPicker['modifiersClassNames'] = {
    onLeave: 'bg-yellow-500/20 text-yellow-300 rounded-full',
  };

  return (
    <>
      <PageHeader
        title="Attendance & Leave"
        description="Track attendance and manage leave requests."
      >
        <Button>
          <PlusCircle />
          New Leave Request
        </Button>
      </PageHeader>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card>
                <CardContent className="p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="w-full"
                        modifiers={modifiers}
                        modifiersClassNames={modifiersClassNames}
                    />
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>Review and approve leave requests from your team.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {leaveRequests.map((request) => {
                    const employee = employees.find(
                      (e) => e.id === request.employeeId
                    );
                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage
                                src={employee?.avatarUrl}
                                alt={employee?.name}
                              />
                              <AvatarFallback>
                                {employee?.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="grid text-sm">
                                <span className="font-semibold">{employee?.name}</span>
                                <span className="text-muted-foreground text-xs">{new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={cn("text-xs font-medium", statusColors[request.status])}
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            {request.status === 'Pending' && (
                                <div className='flex gap-2 justify-end'>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-green-500/10 hover:text-green-400">
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/10 hover:text-red-400">
                                        <X className="h-4 w-4" />
                                    </Button>
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
        </div>
      </div>
    </>
  );
}
