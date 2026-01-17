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
import { useLoading, LoadingButton, LoadingOverlay } from '@/hooks/use-loading';
import { useApiClient } from '@/lib/api-client';

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
    const api = useApiClient();
    const { isLoading } = useLoading();
    const [loading, setLoading] = React.useState(true);
    const [employeeId, setEmployeeId] = React.useState<string | null>(null);
    const [projectName, setProjectName] = React.useState<string>('');
    const [availableProjects, setAvailableProjects] = React.useState<{id: string, name: string, isPrimary: boolean}[]>([]);
    const [dailyLogs, setDailyLogs] = React.useState<DailyLog[]>([]);
    const [addDialogOpen, setAddDialogOpen] = React.useState(false);
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
                
                // Use the new /me endpoint
                const empRes = await fetch(`/api/employees/me?email=${encodeURIComponent(user.email)}`);
                console.log('Employee response status:', empRes.status);
                
                if (!empRes.ok) {
                    console.error('Failed to fetch employee:', empRes.status, empRes.statusText);
                    setLoading(false);
                    return;
                }
                
                const employeeData = await empRes.json();
                console.log('Employee data:', employeeData);

                if (employeeData?.employee?.id) {
                    setEmployeeId(employeeData.employee.id);
                    
                    // Set available projects
                    const projects = employeeData.projects || [];
                    setAvailableProjects(projects.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        isPrimary: p.isPrimary
                    })));
                    
                    // Get the primary project (where isPrimary is true)
                    const primaryProject = projects.find((p: any) => p.isPrimary);
                    const primaryProjectName = primaryProject?.name || employeeData.employee.project || 'Unassigned';
                    
                    console.log('Setting project name:', primaryProjectName);
                    setProjectName(primaryProjectName);

                    if (primaryProjectName && primaryProjectName !== 'Unassigned') {
                        await fetchLogsForProject(primaryProjectName, employeeData.employee.id);
                    } else {
                        console.log('No project assigned or project is Unassigned');
                        setDailyLogs([]);
                    }
                } else {
                    console.log('No employee ID found in response');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load your data. Please try refreshing the page.',
                    variant: 'destructive'
                });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.email, toast]);

    const fetchLogsForProject = async (projectName: string, empId: string) => {
        try {
            console.log('Fetching logs for project:', projectName);
            const logsRes = await fetch(`/api/projects/${encodeURIComponent(projectName)}/daily-logs?employeeId=${empId}`);
            console.log('Logs response status:', logsRes.status);
            if (logsRes.ok) {
                const logsData = await logsRes.json();
                console.log('Logs data:', logsData);
                setDailyLogs(Array.isArray(logsData) ? logsData : []);
            } else {
                console.error('Failed to fetch logs:', await logsRes.text());
                setDailyLogs([]);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
            setDailyLogs([]);
        }
    };

    const handleProjectChange = async (newProjectName: string) => {
        setProjectName(newProjectName);
        if (employeeId && newProjectName !== 'Unassigned') {
            await fetchLogsForProject(newProjectName, employeeId);
        } else {
            setDailyLogs([]);
        }
    };

    const handleAddLog = async () => {
        if (!employeeId || !projectName || projectName === 'Unassigned' || !newLog.summary) {
            toast({ title: 'Error', description: 'Please fill in the summary', variant: 'destructive' });
            return;
        }
        
        const result = await api.post(
            `/api/projects/${encodeURIComponent(projectName)}/daily-logs`,
            {
                employeeId,
                summary: newLog.summary,
                hoursWorked: newLog.hoursWorked ? parseFloat(newLog.hoursWorked) : null,
                category: newLog.category,
            },
            {
                loadingKey: 'add-daily-log',
                successMessage: 'Daily log added successfully!',
                showSuccessToast: true,
                onSuccess: (log) => {
                    setDailyLogs([log, ...dailyLogs]);
                    setAddDialogOpen(false);
                    setNewLog({ summary: '', hoursWorked: '', category: 'General' });
                }
            }
        );
    };

    const handleDeleteLog = async (logId: string) => {
        if (!projectName) return;
        
        const result = await api.delete(
            `/api/projects/${encodeURIComponent(projectName)}/daily-logs/${logId}`,
            {
                loadingKey: `delete-log-${logId}`,
                successMessage: 'Log deleted successfully!',
                showSuccessToast: true,
                onSuccess: () => {
                    setDailyLogs(dailyLogs.filter(l => l.id !== logId));
                }
            }
        );
    };

    const refreshLogs = async () => {
        if (employeeId && projectName && projectName !== 'Unassigned') {
            await fetchLogsForProject(projectName, employeeId);
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

    if (!employeeId) {
        return (
            <LoadingOverlay loading={loading} loadingText="Loading your daily logs...">
                <PageHeader title="Daily Logs" description="Record your daily work updates." />
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg mb-2">Employee Profile Not Found</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            Your employee profile could not be found. Please contact your administrator.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Current email: <code className="bg-muted px-2 py-1 rounded">{user?.email}</code>
                        </p>
                    </CardContent>
                </Card>
            </LoadingOverlay>
        );
    }

    if (availableProjects.length === 0) {
        return (
            <LoadingOverlay loading={loading} loadingText="Loading your daily logs...">
                <PageHeader title="Daily Logs" description="Record your daily work updates." />
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg mb-2">No Projects Assigned</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                            You need to be assigned to at least one project to create daily logs.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Please contact your administrator to get assigned to a project.
                        </p>
                    </CardContent>
                </Card>
            </LoadingOverlay>
        );
    }

    return (
        <LoadingOverlay loading={loading} loadingText="Loading your daily logs...">
            <PageHeader title="Daily Logs" description={`Record your daily work updates${projectName ? ` for ${projectName}` : ''}`}>
                <div className="flex gap-2">
                    {availableProjects.length > 1 && (
                        <Select value={projectName} onValueChange={handleProjectChange}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableProjects.map((project) => (
                                    <SelectItem key={project.id} value={project.name}>
                                        <div className="flex items-center gap-2">
                                            {project.name}
                                            {project.isPrimary && (
                                                <Badge variant="secondary" className="text-xs">Primary</Badge>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    <LoadingButton 
                        onClick={() => setAddDialogOpen(true)}
                        loading={isLoading('add-daily-log')}
                        loadingText="Adding..."
                    >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Log
                    </LoadingButton>
                </div>
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
                                        <LoadingButton 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-red-500 hover:text-red-600" 
                                            onClick={() => handleDeleteLog(log.id)}
                                            loading={isLoading(`delete-log-${log.id}`)}
                                            loadingText=""
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </LoadingButton>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-semibold mb-2">No logs yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">Start recording your daily work updates</p>
                            <LoadingButton onClick={() => setAddDialogOpen(true)}>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add Your First Log
                            </LoadingButton>
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
                        <LoadingButton 
                            onClick={handleAddLog} 
                            disabled={!newLog.summary}
                            loading={isLoading('add-daily-log')}
                            loadingText="Adding..."
                        >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Log
                        </LoadingButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </LoadingOverlay>
    );
}
