'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Clock, Calendar as CalendarIcon, LoaderCircle, Trash2, FileText } from 'lucide-react';
import { useAuth } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type DailyLog = {
    id: string;
    summary: string;
    hoursWorked?: number;
    category: string;
    date: string;
    employee: { id: string; name: string; avatarUrl?: string };
    project?: { name: string };
};

const categoryColors: Record<string, string> = {
    General: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
    Environment: 'bg-green-500/10 text-green-600 dark:text-green-400',
    Deployment: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    BugFix: 'bg-red-500/10 text-red-600 dark:text-red-400',
    Feature: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    Documentation: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    Meeting: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    Review: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
};

export default function DailyLogsPage() {
    const auth = useAuth();
    const { user } = useUser(auth);
    const { toast } = useToast();
    const [loading, setLoading] = React.useState(true);
    const [employeeId, setEmployeeId] = React.useState<string | null>(null);
    const [projectName, setProjectName] = React.useState<string>('');
    const [dailyLogs, setDailyLogs] = React.useState<DailyLog[]>([]);
    const [addDialogOpen, setAddDialogOpen] = React.useState(false);
    const [adding, setAdding] = React.useState(false);
    const [newLog, setNewLog] = React.useState({
        summary: '',
        hoursWorked: '',
        category: 'General',
    });

    React.useEffect(() => {
        const fetchData = async () => {
            if (!user?.email) {
                console.log('No user email found');
                return;
            }
            try {
                console.log('Fetching employee data for email:', user.email);
                
                // Use the new /me endpoint for better performance
                const empRes = await fetch(`/api/employees/me?email=${encodeURIComponent(user.email)}`);
                console.log('Employee response status:', empRes.status);
                
                if (!empRes.ok) {
                    console.error('Failed to fetch employee:', empRes.status, empRes.statusText);
                    setLoading(false);
                    return;
                }
                
                const currentEmployee = await empRes.json();
                console.log('Current employee data:', currentEmployee);

                if (currentEmployee?.id) {
                    setEmployeeId(currentEmployee.id);
                    const projectName = currentEmployee.project || 'Unassigned';
                    console.log('Setting project name:', projectName);
                    setProjectName(projectName);

                    if (currentEmployee.project && currentEmployee.project !== 'Unassigned') {
                        console.log('Fetching logs for project:', currentEmployee.project);
                        const logsRes = await fetch(`/api/projects/${encodeURIComponent(currentEmployee.project)}/daily-logs?employeeId=${currentEmployee.id}`);
                        console.log('Logs response status:', logsRes.status);
                        if (logsRes.ok) {
                            const logsData = await logsRes.json();
                            console.log('Logs data:', logsData);
                            setDailyLogs(Array.isArray(logsData) ? logsData : []);
                        } else {
                            console.error('Failed to fetch logs:', await logsRes.text());
                        }
                    } else {
                        console.log('No project assigned or project is Unassigned');
                    }
                } else {
                    console.log('No employee ID found');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.email]);

    const handleAddLog = async () => {
        if (!employeeId || !projectName || projectName === 'Unassigned' || !newLog.summary) {
            toast({ title: 'Error', description: 'Please fill in the summary', variant: 'destructive' });
            return;
        }
        setAdding(true);
        try {
            const res = await fetch(`/api/projects/${encodeURIComponent(projectName)}/daily-logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    employeeId,
                    summary: newLog.summary,
                    hoursWorked: newLog.hoursWorked || null,
                    category: newLog.category,
                }),
            });
            if (!res.ok) throw new Error('Failed to add log');
            const log = await res.json();
            setDailyLogs([log, ...dailyLogs]);
            setAddDialogOpen(false);
            setNewLog({ summary: '', hoursWorked: '', category: 'General' });
            toast({ title: 'Success', description: 'Daily log added successfully' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to add daily log', variant: 'destructive' });
        } finally {
            setAdding(false);
        }
    };

    const handleDeleteLog = async (logId: string) => {
        if (!projectName) return;
        try {
            await fetch(`/api/projects/${encodeURIComponent(projectName)}/daily-logs/${logId}`, { method: 'DELETE' });
            setDailyLogs(dailyLogs.filter(l => l.id !== logId));
            toast({ title: 'Success', description: 'Log deleted' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete log', variant: 'destructive' });
        }
    };

    // Calculate stats
    const todayLogs = (dailyLogs || []).filter(l => {
        if (!l?.date) return false;
        const logDate = new Date(l.date).toDateString();
        return logDate === new Date().toDateString();
    });
    const totalHoursToday = todayLogs.reduce((sum, l) => sum + (l?.hoursWorked || 0), 0);
    const totalLogsThisWeek = (dailyLogs || []).filter(l => {
        if (!l?.date) return false;
        const logDate = new Date(l.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return logDate >= weekAgo;
    }).length;

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!projectName || projectName === 'Unassigned') {
        return (
            <>
                <PageHeader title="Daily Logs" description="Record your daily work updates." />
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No Project Assigned</h3>
                        <p className="text-muted-foreground text-sm">You need to be assigned to a project to add daily logs.</p>
                        <p className="text-xs text-muted-foreground mt-2">Debug: projectName = "{projectName}"</p>
                    </CardContent>
                </Card>
            </>
        );
    }

    return (
        <>
            <PageHeader title="Daily Logs" description={`Record your daily work updates for ${projectName}`}>
                <Button onClick={() => setAddDialogOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Log
                </Button>
            </PageHeader>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-lg">
                                <FileText className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{todayLogs.length}</p>
                                <p className="text-sm text-muted-foreground">Logs Today</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <Clock className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalHoursToday}</p>
                                <p className="text-sm text-muted-foreground">Hours Today</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-lg">
                                <CalendarIcon className="h-6 w-6 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{totalLogsThisWeek}</p>
                                <p className="text-sm text-muted-foreground">Logs This Week</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Logs List */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Daily Logs</CardTitle>
                    <CardDescription>Track what you've worked on each day</CardDescription>
                </CardHeader>
                <CardContent>
                    {dailyLogs && dailyLogs.length > 0 ? (
                        <div className="space-y-4">
                            {dailyLogs.map((log) => {
                                if (!log?.id) return null;
                                return (
                                    <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline" className={cn('text-xs', categoryColors[log.category] || categoryColors.General)}>
                                                    {log.category || 'General'}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <CalendarIcon className="h-3 w-3" />
                                                    {log.date ? format(new Date(log.date), 'MMM dd, yyyy') : 'N/A'}
                                                </span>
                                                {log.hoursWorked && (
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {log.hoursWorked} hrs
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm">{log.summary || 'No summary'}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteLog(log.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-semibold mb-2">No logs yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">Start recording your daily work updates</p>
                            <Button onClick={() => setAddDialogOpen(true)}>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add Your First Log
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Log Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Daily Log</DialogTitle>
                        <DialogDescription>Record what you worked on today for {projectName}.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>What did you work on? *</Label>
                            <Textarea
                                value={newLog.summary}
                                onChange={(e) => setNewLog({ ...newLog, summary: e.target.value })}
                                placeholder="e.g., Updated environment variables, Fixed login bug, Implemented new feature..."
                                rows={4}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Category</Label>
                                <Select value={newLog.category} onValueChange={(v) => setNewLog({ ...newLog, category: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="General">General</SelectItem>
                                        <SelectItem value="Environment">Environment Setup</SelectItem>
                                        <SelectItem value="Deployment">Deployment</SelectItem>
                                        <SelectItem value="BugFix">Bug Fix</SelectItem>
                                        <SelectItem value="Feature">New Feature</SelectItem>
                                        <SelectItem value="Documentation">Documentation</SelectItem>
                                        <SelectItem value="Meeting">Meeting</SelectItem>
                                        <SelectItem value="Review">Code Review</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Hours Worked</Label>
                                <Input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max="24"
                                    value={newLog.hoursWorked}
                                    onChange={(e) => setNewLog({ ...newLog, hoursWorked: e.target.value })}
                                    placeholder="e.g., 4.5"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddLog} disabled={adding}>
                            {adding ? <LoaderCircle className="h-4 w-4 animate-spin mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                            Add Log
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
