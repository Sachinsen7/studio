'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, PlayCircle, Camera, Upload, Users, LoaderCircle } from 'lucide-react';
import { useAuth } from '@/firebase';
import { useUser } from '@/firebase/auth/use-user';

type Task = {
    id: string;
    title: string;
    description?: string;
    status: 'ToDo' | 'InProgress' | 'Done';
    projectId: string;
    project?: { name: string };
    submissions?: { id: string; selfieUrl?: string; notes?: string; submittedAt: string }[];
};

type TeamMember = {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role: string;
};

const statusConfig = {
    ToDo: { label: 'To Do', color: 'bg-red-500/20 text-red-600 dark:text-red-400', icon: Clock },
    InProgress: { label: 'In Progress', color: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400', icon: PlayCircle },
    Done: { label: 'Done', color: 'bg-green-500/20 text-green-600 dark:text-green-400', icon: CheckCircle },
};

export default function EmployeeTasksPage() {
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const [team, setTeam] = React.useState<TeamMember[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [submitDialogOpen, setSubmitDialogOpen] = React.useState(false);
    const [teamDialogOpen, setTeamDialogOpen] = React.useState(false);
    const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
    const [selfieUrl, setSelfieUrl] = React.useState('');
    const [notes, setNotes] = React.useState('');
    const [submitting, setSubmitting] = React.useState(false);
    const { toast } = useToast();
    const auth = useAuth();
    const { user } = useUser(auth);
    const [employeeId, setEmployeeId] = React.useState<string | null>(null);
    const [projectName, setProjectName] = React.useState<string>('');

    // Fetch employee data and tasks
    React.useEffect(() => {
        const fetchData = async () => {
            if (!user?.email) return;
            try {
                // Get employee by email
                const empRes = await fetch('/api/employees');
                const employees = await empRes.json();
                const currentEmployee = employees.find((e: { email: string }) => e.email === user.email);

                if (currentEmployee) {
                    setEmployeeId(currentEmployee.id);
                    setProjectName(currentEmployee.project);

                    // Fetch tasks for this employee
                    const tasksRes = await fetch(`/api/tasks?assigneeId=${currentEmployee.id}`);
                    const tasksData = await tasksRes.json();
                    setTasks(tasksData);

                    // Fetch team members
                    const teamRes = await fetch(`/api/projects/${encodeURIComponent(currentEmployee.project)}/team`);
                    const teamData = await teamRes.json();
                    setTeam(teamData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.email]);

    const handleSubmitTask = async () => {
        if (!selectedTask || !employeeId) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/tasks/${selectedTask.id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId, selfieUrl, notes }),
            });
            if (!res.ok) throw new Error('Failed to submit');

            // Update local state
            setTasks((prev) => prev.map((t) =>
                t.id === selectedTask.id ? { ...t, status: 'Done' as const } : t
            ));

            toast({ title: 'Task Submitted!', description: 'Your work has been recorded.' });
            setSubmitDialogOpen(false);
            setSelfieUrl('');
            setNotes('');
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to submit task', variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    const tasksByStatus = {
        ToDo: tasks.filter((t) => t.status === 'ToDo'),
        InProgress: tasks.filter((t) => t.status === 'InProgress'),
        Done: tasks.filter((t) => t.status === 'Done'),
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            <PageHeader title="My Tasks" description={`Tasks assigned to you in ${projectName}`}>
                <Button variant="outline" onClick={() => setTeamDialogOpen(true)}>
                    <Users className="mr-2 h-4 w-4" />
                    View Team ({team.length})
                </Button>
            </PageHeader>

            {/* Task Stats */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                {Object.entries(statusConfig).map(([status, config]) => {
                    const Icon = config.icon;
                    const count = tasksByStatus[status as keyof typeof tasksByStatus].length;
                    return (
                        <Card key={status}>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${config.color}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{count}</p>
                                        <p className="text-sm text-muted-foreground">{config.label}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Tasks Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
                    const config = statusConfig[status as keyof typeof statusConfig];
                    return (
                        <div key={status}>
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${config.color.split(' ')[0]}`} />
                                {config.label} ({statusTasks.length})
                            </h3>
                            <div className="space-y-3">
                                {statusTasks.map((task) => (
                                    <Card key={task.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <h4 className="font-medium mb-2">{task.title}</h4>
                                            {task.description && (
                                                <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline">{task.project?.name || projectName}</Badge>
                                                {status !== 'Done' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => { setSelectedTask(task); setSubmitDialogOpen(true); }}
                                                    >
                                                        <Camera className="h-4 w-4 mr-1" />
                                                        Submit
                                                    </Button>
                                                )}
                                                {status === 'Done' && task.submissions?.[0]?.selfieUrl && (
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={task.submissions[0].selfieUrl} />
                                                        <AvatarFallback>✓</AvatarFallback>
                                                    </Avatar>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {statusTasks.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-8">No tasks</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Submit Task Dialog */}
            <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Submit Task</DialogTitle>
                        <DialogDescription>Complete "{selectedTask?.title}" with a selfie and notes.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Selfie / Proof Image URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="https://example.com/selfie.jpg"
                                    value={selfieUrl}
                                    onChange={(e) => setSelfieUrl(e.target.value)}
                                />
                                {selfieUrl && (
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={selfieUrl} />
                                        <AvatarFallback><Camera className="h-4 w-4" /></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">Upload your image to a service like Imgur and paste the URL</p>
                        </div>
                        <div className="grid gap-2">
                            <Label>Notes (Optional)</Label>
                            <Textarea
                                placeholder="Describe what you completed..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSubmitDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmitTask} disabled={submitting}>
                            {submitting ? <LoaderCircle className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                            Submit Task
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Team Dialog */}
            <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Project Team: {projectName}</DialogTitle>
                        <DialogDescription>{team.length} team members working on this project</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {team.map((member) => (
                            <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={member.avatarUrl} />
                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-medium">{member.name}</p>
                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                </div>
                                <Badge variant="outline">{member.role}</Badge>
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setTeamDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
