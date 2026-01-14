'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { Clock, LogIn, LogOut, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type AttendanceRecord = {
    id: string;
    date: Date;
    status: 'Present' | 'Absent' | 'Late' | 'HalfDay' | 'OnLeave';
    checkIn?: string;
    checkOut?: string;
};

const statusColors = {
    Present: 'bg-green-900/20 text-green-400 border-green-400/20',
    Late: 'bg-orange-900/20 text-orange-400 border-orange-400/20',
    Absent: 'bg-red-900/20 text-red-400 border-red-400/20',
    HalfDay: 'bg-blue-900/20 text-blue-400 border-blue-400/20',
    OnLeave: 'bg-yellow-900/20 text-yellow-400 border-yellow-400/20',
};

export default function MyAttendancePage() {
    const auth = useAuth();
    const { user } = useUser(auth);
    const { toast } = useToast();
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [currentTime, setCurrentTime] = React.useState(new Date());
    const [todayAttendance, setTodayAttendance] = React.useState<AttendanceRecord | null>(null);
    const [monthlyAttendance, setMonthlyAttendance] = React.useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = React.useState(false);

    // Update current time every second
    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Mock data - Replace with actual API calls
    React.useEffect(() => {
        // Simulate today's attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        setTodayAttendance({
            id: '1',
            date: today,
            status: 'Present',
            checkIn: '09:15:00',
            checkOut: undefined,
        });

        // Simulate monthly attendance
        const records: AttendanceRecord[] = [];
        for (let i = 1; i <= 20; i++) {
            const recordDate = new Date(2026, 0, i);
            records.push({
                id: `att-${i}`,
                date: recordDate,
                status: i % 7 === 0 ? 'OnLeave' : i % 5 === 0 ? 'Late' : 'Present',
                checkIn: i % 7 === 0 ? undefined : `09:${String(i % 60).padStart(2, '0')}:00`,
                checkOut: i % 7 === 0 ? undefined : `18:${String(i % 60).padStart(2, '0')}:00`,
            });
        }
        setMonthlyAttendance(records);
    }, []);

    const handlePunchIn = async () => {
        setLoading(true);
        try {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { hour12: false });
            
            // Check if late (after 9:30 AM)
            const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);
            
            setTodayAttendance({
                id: '1',
                date: new Date(),
                status: isLate ? 'Late' : 'Present',
                checkIn: timeString,
            });

            toast({
                title: 'Punched In Successfully',
                description: `Check-in time: ${timeString}${isLate ? ' (Late)' : ''}`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to punch in',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePunchOut = async () => {
        setLoading(true);
        try {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { hour12: false });
            
            setTodayAttendance(prev => prev ? {
                ...prev,
                checkOut: timeString,
            } : null);

            toast({
                title: 'Punched Out Successfully',
                description: `Check-out time: ${timeString}`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to punch out',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalHours = (checkIn?: string, checkOut?: string) => {
        if (!checkIn || !checkOut) return '0:00';
        
        const [inH, inM] = checkIn.split(':').map(Number);
        const [outH, outM] = checkOut.split(':').map(Number);
        
        const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        return `${hours}:${String(minutes).padStart(2, '0')}`;
    };

    // Calculate monthly stats
    const thisMonthStats = React.useMemo(() => {
        const totalDays = monthlyAttendance.length;
        const presentDays = monthlyAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
        const lateDays = monthlyAttendance.filter(a => a.status === 'Late').length;
        const leaveDays = monthlyAttendance.filter(a => a.status === 'OnLeave').length;
        
        const totalHours = monthlyAttendance.reduce((sum, record) => {
            if (record.checkIn && record.checkOut) {
                const hours = parseFloat(calculateTotalHours(record.checkIn, record.checkOut).replace(':', '.'));
                return sum + hours;
            }
            return sum;
        }, 0);

        return { totalDays, presentDays, lateDays, leaveDays, totalHours: totalHours.toFixed(1) };
    }, [monthlyAttendance]);

    // Calendar modifiers
    const attendanceDays = monthlyAttendance.reduce((acc, record) => {
        const status = record.status.toLowerCase();
        if (!acc[status]) acc[status] = [];
        acc[status].push(record.date);
        return acc;
    }, {} as Record<string, Date[]>);

    return (
        <>
            <PageHeader
                title="My Attendance"
                description="Track your daily attendance and view your monthly records."
            />

            {/* Punch In/Out Section */}
            <div className="grid gap-6 md:grid-cols-3 mb-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Today's Attendance
                            </div>
                            {/* Wall Clock Style */}
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-4 border-primary/20 bg-gradient-to-br from-background to-muted flex items-center justify-center shadow-lg">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold tabular-nums">
                                            {currentTime.toLocaleTimeString('en-US', { 
                                                hour: '2-digit', 
                                                minute: '2-digit',
                                                hour12: false 
                                            })}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {currentTime.toLocaleDateString('en-US', { 
                                                month: 'short', 
                                                day: 'numeric' 
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardTitle>
                        <CardDescription>
                            {currentTime.toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-6">
                            {todayAttendance && (
                                <Badge variant="outline" className={cn('text-sm', statusColors[todayAttendance.status])}>
                                    {todayAttendance.status}
                                </Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    <LogIn className="h-4 w-4" />
                                    Punch In
                                </div>
                                <div className="text-2xl font-semibold">
                                    {todayAttendance?.checkIn || '--:--:--'}
                                </div>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    <LogOut className="h-4 w-4" />
                                    Punch Out
                                </div>
                                <div className="text-2xl font-semibold">
                                    {todayAttendance?.checkOut || '--:--:--'}
                                </div>
                            </div>
                        </div>

                        {todayAttendance?.checkIn && todayAttendance?.checkOut && (
                            <div className="p-4 bg-muted/50 rounded-lg mb-4">
                                <div className="text-sm text-muted-foreground mb-1">Total Hours Today</div>
                                <div className="text-3xl font-bold">
                                    {calculateTotalHours(todayAttendance.checkIn, todayAttendance.checkOut)} hrs
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button 
                                onClick={handlePunchIn} 
                                disabled={loading || !!todayAttendance?.checkIn}
                                className="flex-1"
                                size="lg"
                            >
                                <LogIn className="mr-2 h-5 w-5" />
                                Punch In
                            </Button>
                            <Button 
                                onClick={handlePunchOut} 
                                disabled={loading || !todayAttendance?.checkIn || !!todayAttendance?.checkOut}
                                variant="outline"
                                className="flex-1"
                                size="lg"
                            >
                                <LogOut className="mr-2 h-5 w-5" />
                                Punch Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            This Month
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="text-sm text-muted-foreground">Total Days</div>
                            <div className="text-2xl font-bold">{thisMonthStats.totalDays}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Total Hours</div>
                            <div className="text-2xl font-bold">{thisMonthStats.totalHours} hrs</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Late Days</div>
                            <div className="text-2xl font-bold text-orange-400">{thisMonthStats.lateDays}</div>
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Leaves Used</div>
                            <div className="text-2xl font-bold text-yellow-400">{thisMonthStats.leaveDays}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Calendar View */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        Monthly Attendance Calendar
                    </CardTitle>
                    <CardDescription>
                        View your attendance history with enhanced visualization
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-[1fr_300px] gap-6">
                        <div className="space-y-4">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border w-full p-4"
                                classNames={{
                                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                    month: "space-y-4 w-full",
                                    caption: "flex justify-center pt-1 relative items-center",
                                    caption_label: "text-lg font-semibold",
                                    nav: "space-x-1 flex items-center",
                                    nav_button: "h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100",
                                    nav_button_previous: "absolute left-1",
                                    nav_button_next: "absolute right-1",
                                    table: "w-full border-collapse space-y-1",
                                    head_row: "flex",
                                    head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
                                    row: "flex w-full mt-2",
                                    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
                                    day: "h-12 w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
                                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                    day_today: "bg-accent text-accent-foreground font-bold",
                                    day_outside: "text-muted-foreground opacity-50",
                                    day_disabled: "text-muted-foreground opacity-50",
                                    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                    day_hidden: "invisible",
                                }}
                                modifiers={{
                                    present: attendanceDays.present || [],
                                    late: attendanceDays.late || [],
                                    absent: attendanceDays.absent || [],
                                    halfday: attendanceDays.halfday || [],
                                    onleave: attendanceDays.onleave || [],
                                }}
                                modifiersClassNames={{
                                    present: 'bg-green-500/30 text-green-300 hover:bg-green-500/40 font-semibold',
                                    late: 'bg-orange-500/30 text-orange-300 hover:bg-orange-500/40 font-semibold',
                                    absent: 'bg-red-500/30 text-red-300 hover:bg-red-500/40 font-semibold',
                                    halfday: 'bg-blue-500/30 text-blue-300 hover:bg-blue-500/40 font-semibold',
                                    onleave: 'bg-yellow-500/30 text-yellow-300 hover:bg-yellow-500/40 font-semibold',
                                }}
                            />
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm">Status Legend</h3>
                                {Object.entries(statusColors).map(([status, color]) => (
                                    <div key={status} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent transition-colors">
                                        <div className={cn('w-6 h-6 rounded-md', color)} />
                                        <span className="text-sm font-medium">{status}</span>
                                    </div>
                                ))}
                            </div>

                            {date && (
                                <Card className="border-2">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">
                                            {date.toLocaleDateString('en-US', { 
                                                weekday: 'long', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {monthlyAttendance.find(a => 
                                            a.date.toDateString() === date.toDateString()
                                        ) ? (
                                            <div className="space-y-3 text-sm">
                                                {(() => {
                                                    const record = monthlyAttendance.find(a => 
                                                        a.date.toDateString() === date.toDateString()
                                                    );
                                                    return record ? (
                                                        <>
                                                            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                                                                <span className="text-muted-foreground">Status:</span>
                                                                <Badge variant="outline" className={cn('text-xs', statusColors[record.status])}>
                                                                    {record.status}
                                                                </Badge>
                                                            </div>
                                                            {record.checkIn && (
                                                                <div className="flex justify-between p-2 hover:bg-muted/50 rounded transition-colors">
                                                                    <span className="text-muted-foreground">Check In:</span>
                                                                    <span className="font-semibold">{record.checkIn}</span>
                                                                </div>
                                                            )}
                                                            {record.checkOut && (
                                                                <div className="flex justify-between p-2 hover:bg-muted/50 rounded transition-colors">
                                                                    <span className="text-muted-foreground">Check Out:</span>
                                                                    <span className="font-semibold">{record.checkOut}</span>
                                                                </div>
                                                            )}
                                                            {record.checkIn && record.checkOut && (
                                                                <div className="flex justify-between p-2 bg-primary/10 rounded border border-primary/20">
                                                                    <span className="text-muted-foreground font-medium">Total Hours:</span>
                                                                    <span className="font-bold text-primary">
                                                                        {calculateTotalHours(record.checkIn, record.checkOut)} hrs
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : null;
                                                })()}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <CalendarIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
                                                <p className="text-sm text-muted-foreground">No attendance record</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
