'use client'
import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { Users, Clock, TrendingUp, CalendarCheck, Loader2 } from 'lucide-react';
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

  // Fetch today's attendance
  const fetchTodayAttendance = React.useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/attendance?date=${today}`);
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
  }, []);

  // Fetch attendance stats
  const fetchStats = React.useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/attendance/stats?date=${today}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  // Fetch calendar data
  const fetchCalendarData = React.useCallback(async (month: Date) => {
    try {
      const monthNum = month.getMonth() + 1;
      const year = month.getFullYear();
      const response = await fetch(`/api/attendance/calendar?month=${monthNum}&year=${year}`);
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
  }, []);

  React.useEffect(() => {
    fetchTodayAttendance();
    fetchStats();
    fetchCalendarData(currentMonth);
  }, [fetchTodayAttendance, fetchStats, fetchCalendarData, currentMonth]);

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
    fetchCalendarData(newMonth);
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
                Monthly attendance overview - Yellow dots indicate leave days
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                month={currentMonth}
                onMonthChange={handleMonthChange}
                className="w-full rounded-md border-0"
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-base font-semibold",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-accent rounded-md transition-colors",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-full font-medium text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                  day: "h-10 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-all",
                  day_range_end: "day-range-end",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-bold",
                  day_today: "bg-accent text-accent-foreground font-bold ring-2 ring-primary ring-offset-2 ring-offset-background",
                  day_outside: "day-outside text-muted-foreground opacity-30",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
                modifiers={{
                  onLeave: leaveDays,
                }}
                modifiersClassNames={{
                  onLeave: 'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-yellow-400 after:rounded-full after:shadow-lg',
                }}
              />
              <div className="mt-6 space-y-3 px-2">
                <h4 className="font-semibold text-sm mb-3">Legend</h4>
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors">
                  <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold text-sm">15</div>
                  <span className="text-sm">Selected Date</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors">
                  <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center font-bold text-sm ring-2 ring-primary ring-offset-2 ring-offset-background">14</div>
                  <span className="text-sm">Today</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors">
                  <div className="w-8 h-8 bg-background border rounded-md flex items-center justify-center text-sm relative">
                    <span>20</span>
                    <div className="absolute bottom-1 w-1.5 h-1.5 bg-yellow-400 rounded-full shadow-lg"></div>
                  </div>
                  <span className="text-sm">Leave Day</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
