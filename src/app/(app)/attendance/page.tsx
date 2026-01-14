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
import { employees, attendance } from '@/lib/data';
import { Users, Clock, TrendingUp, CalendarCheck } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  Present: 'text-green-400 bg-green-900/20 border-green-400/20',
  Late: 'text-orange-400 bg-orange-900/20 border-orange-400/20',
  Absent: 'text-red-400 bg-red-900/20 border-red-400/20',
  HalfDay: 'text-blue-400 bg-blue-900/20 border-blue-400/20',
  OnLeave: 'text-yellow-400 bg-yellow-900/20 border-yellow-400/20',
};

export default function AttendancePage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  
  const onLeaveDays = attendance
    .filter(a => a.status === 'On Leave')
    .map(a => a.date);

  // Mock attendance data for today
  const todayAttendance = employees.map(emp => ({
    employee: emp,
    status: Math.random() > 0.2 ? 'Present' : Math.random() > 0.5 ? 'Late' : 'Absent',
    checkIn: '09:15 AM',
    checkOut: '06:30 PM',
  }));

  const stats = {
    present: todayAttendance.filter(a => a.status === 'Present').length,
    late: todayAttendance.filter(a => a.status === 'Late').length,
    absent: todayAttendance.filter(a => a.status === 'Absent').length,
    onLeave: 2,
  };

  return (
    <>
      <PageHeader
        title="Attendance Management"
        description="Track and manage employee attendance records."
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-900/20 rounded-lg">
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.present}</p>
                <p className="text-sm text-muted-foreground">Present Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-900/20 rounded-lg">
                <Clock className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.late}</p>
                <p className="text-sm text-muted-foreground">Late Arrivals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.absent}</p>
                <p className="text-sm text-muted-foreground">Absent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-900/20 rounded-lg">
                <CalendarCheck className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.onLeave}</p>
                <p className="text-sm text-muted-foreground">On Leave</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayAttendance.map((record) => (
                    <TableRow key={record.employee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={record.employee.avatarUrl}
                              alt={record.employee.name}
                            />
                            <AvatarFallback>
                              {record.employee.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="grid text-sm">
                            <span className="font-semibold">{record.employee.name}</span>
                            <span className="text-muted-foreground text-xs">{record.employee.role}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("text-xs font-medium", statusColors[record.status as keyof typeof statusColors])}
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{record.checkIn}</TableCell>
                      <TableCell className="text-sm">{record.checkOut}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>Monthly attendance overview</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full"
                modifiers={{
                  onLeave: onLeaveDays,
                }}
                modifiersClassNames={{
                  onLeave: 'bg-yellow-500/20 text-yellow-300 rounded-full',
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
