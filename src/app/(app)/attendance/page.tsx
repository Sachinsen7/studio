'use client'
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SimpleCalendar } from '@/components/simple-calendar';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Clock, TrendingUp, CalendarCheck, Loader2, Filter } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  Present: 'text-green-400 bg-green-900/20 border-green-400/20',
  Late: 'text-orange-400 bg-orange-900/20 border-orange-400/20',
  Absent: 'text-red-400 bg-red-900/20 border-red-400/20',
  HalfDay: 'text-blue-400 bg-blue-900/20 border-blue-400/20',
  OnLeave: 'text-yellow-400 bg-yellow-900/20 border-yellow-400/20',
};

interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: string;
  checkIn: string | null;
  checkOut: string | null;
  employee: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    role: string;
    project: string;
  };
}

interface Employee {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
}

interface Stats {
  present: number;
  late: number;
  absent: number;
  onLeave: number;
  halfDay: number;
  total: number;
}

export default function AttendancePage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [attendanceRecords, setAttendanceRecords] = React.useState<AttendanceRecord[]>([]);
  const [allEmployees, setAllEmployees] = React.useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = React.useState<string>('all');
  const [stats, setStats] = React.useState<Stats>({
    present: 0,
    late: 0,
    absent: 0,
    onLeave: 0,
    halfDay: 0,
    total: 0,
  });
  const [leaveDays, setLeaveDays] = React.useState<Date[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDateRecord, setSelectedDateRecord] = React.useState<AttendanceRecord | null>(null);

  // Fetch employees
  React.useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('/api/employees?active=true'); // Only fetch active employees
        if (response.ok) {
          const data = await response.json();
          setAllEmployees(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, []);

  // Fetch today's attendance
  const fetchTodayAttendance = React.useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const url = selectedEmployee === 'all'
        ? `/api/attendance?date=${today}`
        : `/api/attendance?date=${today}&employeeId=${selectedEmployee}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(Array.isArray(data) ? data : []);
      } else {
        setAttendanceRecords([]);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  }, [selectedEmployee]);

  // Fetch attendance stats
  const fetchStats = React.useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const url = selectedEmployee === 'all'
        ? `/api/attendance/stats?date=${today}`
        : `/api/attendance/stats?date=${today}&employeeId=${selectedEmployee}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [selectedEmployee]);

  // Fetch calendar data
  const fetchCalendarData = React.useCallback(async (month: Date) => {
    try {
      const monthNum = month.getMonth() + 1;
      const year = month.getFullYear();
      const url = selectedEmployee === 'all'
        ? `/api/attendance/calendar?month=${monthNum}&year=${year}`
        : `/api/attendance/calendar?month=${monthNum}&year=${year}&employeeId=${selectedEmployee}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const leaveDates = Array.isArray(data?.leaveDays) ? data.leaveDays.map((dateStr: string) => new Date(dateStr)) : [];
        setLeaveDays(leaveDates);
      } else {
        setLeaveDays([]);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setLeaveDays([]);
    }
  }, [selectedEmployee]);

  // Fetch attendance for selected date
  const fetchSelectedDateAttendance = React.useCallback(async (selectedDate: Date) => {
    if (!selectedDate || selectedEmployee === 'all') {
      setSelectedDateRecord(null);
      return;
    }

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(`/api/attendance?date=${dateStr}&employeeId=${selectedEmployee}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setSelectedDateRecord(data[0]);
        } else {
          setSelectedDateRecord(null);
        }
      }
    } catch (error) {
      console.error('Error fetching selected date attendance:', error);
      setSelectedDateRecord(null);
    }
  }, [selectedEmployee]);

  React.useEffect(() => {
    fetchTodayAttendance();
    fetchStats();
    fetchCalendarData(currentMonth);
  }, [fetchTodayAttendance, fetchStats, fetchCalendarData, currentMonth, selectedEmployee]);

  React.useEffect(() => {
    if (date) {
      fetchSelectedDateAttendance(date);
    }
  }, [date, fetchSelectedDateAttendance]);

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
    fetchCalendarData(newMonth);
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      fetchSelectedDateAttendance(newDate);
    }
  };

  return (
    <>
      <PageHeader
        title="Attendance Management"
        description="Track and manage employee attendance records."
      />

      {/* Employee Filter */}
      <div className="mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Filter by Employee</label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {allEmployees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        <div className="flex items-center gap-2">
                          <span>{emp.name}</span>
                          <span className="text-xs text-muted-foreground">({emp.role})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedEmployee !== 'all' && (
                <Badge variant="secondary" className="ml-auto">
                  Filtered
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
              <CardTitle>
                {selectedEmployee === 'all' ? "Today's Attendance" : `${allEmployees.find(e => e.id === selectedEmployee)?.name}'s Attendance`}
              </CardTitle>
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
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : attendanceRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No attendance records for today
                </div>
              ) : (
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
                    {Array.isArray(attendanceRecords) && attendanceRecords.length > 0 ? attendanceRecords.map((record) => (
                      <TableRow key={record?.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage
                                src={record?.employee?.avatarUrl || undefined}
                                alt={record?.employee?.name || 'Employee'}
                              />
                              <AvatarFallback>
                                {record?.employee?.name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="grid text-sm">
                              <span className="font-semibold">{record?.employee?.name || 'Unknown'}</span>
                              <span className="text-muted-foreground text-xs">{record?.employee?.role || ''}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("text-xs font-medium", statusColors[record?.status as keyof typeof statusColors] || statusColors.Absent)}
                          >
                            {record?.status || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{record?.checkIn || '-'}</TableCell>
                        <TableCell className="text-sm">{record?.checkOut || '-'}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No attendance records for today
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
              <CardDescription>
                {selectedEmployee === 'all'
                  ? 'Monthly attendance overview - Yellow dots indicate leave days'
                  : `${allEmployees.find(e => e.id === selectedEmployee)?.name}'s monthly attendance`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <SimpleCalendar
                selected={date}
                onSelect={handleDateSelect}
                month={currentMonth}
                onMonthChange={handleMonthChange}
                className="rounded-md border-0"
                modifiers={{
                  onLeave: leaveDays,
                }}
                modifiersClassNames={{
                  onLeave: 'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-yellow-400 after:rounded-full',
                }}
              />
              <div className="mt-6 space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Calendar Legend</h4>

                <div className="grid gap-3">
                  {/* Selected Date - Dynamic */}
                  {date && (
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
                        {date.getDate()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        {selectedDateRecord ? (
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={cn("text-xs", statusColors[selectedDateRecord.status as keyof typeof statusColors])}>
                              {selectedDateRecord.status}
                            </Badge>
                            {selectedDateRecord.checkIn && (
                              <span className="text-xs text-muted-foreground">
                                {selectedDateRecord.checkIn} - {selectedDateRecord.checkOut || 'Ongoing'}
                              </span>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            {selectedEmployee === 'all' ? 'Click to view details' : 'No attendance record'}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Today */}
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all">
                    <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center font-bold text-sm ring-2 ring-primary ring-offset-2 ring-offset-background shadow-sm">
                      {new Date().getDate()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Today</p>
                      <p className="text-xs text-muted-foreground">Current date highlighted</p>
                    </div>
                  </div>

                  {/* Leave Day */}
                  {leaveDays.length > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-all">
                      <div className="w-10 h-10 bg-background border-2 rounded-lg flex items-center justify-center text-sm relative shadow-sm">
                        <span className="font-medium">{leaveDays[0]?.getDate() || '20'}</span>
                        <div className="absolute bottom-1.5 w-2 h-2 bg-yellow-400 rounded-full shadow-md"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Leave Days</p>
                        <p className="text-xs text-muted-foreground">
                          {leaveDays.length} {leaveDays.length === 1 ? 'day' : 'days'} this month
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    {selectedEmployee === 'all'
                      ? 'Select an employee above to view individual attendance details'
                      : 'Click any date to view attendance details for that day'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
