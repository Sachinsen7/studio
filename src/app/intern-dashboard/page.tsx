'use client';

import * as React from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { ListTodo, CheckCircle2, Award, ArrowUpRight, FolderKanban, Clock, LoaderCircle } from 'lucide-react';
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
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

type Task = {
    id: string;
    title: string;
    status: string;
    projectId: string;
    project?: { id: string; name: string };
};

type Evaluation = {
    id: string;
    rating: number;
    feedback: string;
    createdAt: string;
    mentorName: string;
};

type Project = {
    id: string;
    name: string;
    status: string;
    progress: number;
};

export default function InternDashboardPage() {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = React.useState(new Date());
    const [loading, setLoading] = React.useState(true);
    const [internId, setInternId] = React.useState<string | null>(null);
    const [myTasks, setMyTasks] = React.useState<Task[]>([]);
    const [myEvaluations, setMyEvaluations] = React.useState<Evaluation[]>([]);
    const [myProjects, setMyProjects] = React.useState<Project[]>([]);
    const [internData, setInternData] = React.useState<any>(null);

    // Update clock every second
    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch intern data
    React.useEffect(() => {
        const fetchData = async () => {
            if (!user?.email) return;
            try {
                // Get intern by email
                const internRes = await fetch(`/api/interns?email=${encodeURIComponent(user.email)}`);
                if (!internRes.ok) {
                    console.error('Failed to fetch intern');
                    setLoading(false);
                    return;
                }

                const interns = await internRes.json();
                const currentIntern = Array.isArray(interns) ? interns.find((i: any) => i.email === user.email) : null;

                if (currentIntern?.id) {
                    setInternId(currentIntern.id);
                    setInternData(currentIntern);

                    // Fetch tasks
                    const tasksRes = await fetch(`/api/tasks?internId=${currentIntern.id}`);
                    if (tasksRes.ok) {
                        const tasksData = await tasksRes.json();
                        setMyTasks(Array.isArray(tasksData) ? tasksData : []);
                    }

                    // Fetch evaluations
                    const evalRes = await fetch(`/api/interns/${currentIntern.id}/evaluations`);
                    if (evalRes.ok) {
                        const evalData = await evalRes.json();
                        setMyEvaluations(Array.isArray(evalData) ? evalData : []);
                    }

                    // Fetch projects
                    const projectsRes = await fetch('/api/projects');
                    if (projectsRes.ok) {
                        const allProjects = await projectsRes.json();
                        if (Array.isArray(allProjects)) {
                            const internProjects = allProjects.filter((p: Project) =>
                                p.name === currentIntern.project ||
                                (currentIntern.projects && JSON.parse(currentIntern.projects || '[]').includes(p.name))
                            );
                            setMyProjects(internProjects);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.email]);

    const inProgressTasks = (myTasks || []).filter(t => t?.status === 'InProgress').length;
    const completedTasks = (myTasks || []).filter(t => t?.status === 'Done').length;
    const averageRating = myEvaluations.length > 0
        ? (myEvaluations.reduce((sum, e) => sum + e.rating, 0) / myEvaluations.length).toFixed(1)
        : 'N/A';

    const statusColors: Record<string, string> = {
        ToDo: 'bg-red-900/50 text-red-300 border-red-400/20',
        InProgress: 'bg-yellow-900/50 text-yellow-300 border-yellow-400/20',
        Done: 'bg-green-900/50 text-green-300 border-green-400/20',
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
            <PageHeader
                title="Intern Dashboard"
                description="Welcome to your internship portal"
            >
                {/* Wall Clock */}
                <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-xl">
                        <div className="text-center">
                            <div className="text-xl font-bold tabular-nums">
                                {currentTime.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                })}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                                {currentTime.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </PageHeader>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="relative transition-all hover:shadow-lg hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasks In Progress</CardTitle>
                        <ListTodo className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{inProgressTasks}</div>
                        <p className="text-xs text-muted-foreground">Keep up the great work</p>
                    </CardContent>
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8">
                        <ArrowUpRight className="h-4 w-4" />
                    </Button>
                </Card>
                <Card className="relative transition-all hover:shadow-lg hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                        <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">+{completedTasks}</div>
                        <p className="text-xs text-muted-foreground">Total completed</p>
                    </CardContent>
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8">
                        <ArrowUpRight className="h-4 w-4" />
                    </Button>
                </Card>
                <Card className="relative transition-all hover:shadow-lg hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Award className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{averageRating}</div>
                        <p className="text-xs text-muted-foreground">Out of 5.0</p>
                    </CardContent>
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8">
                        <ArrowUpRight className="h-4 w-4" />
                    </Button>
                </Card>
            </div>

            {/* Projects Section */}
            {myProjects && myProjects.length > 0 && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>My Projects</CardTitle>
                        <CardDescription>Projects you're currently working on</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            {myProjects.map((project) => {
                                const projectTasks = (myTasks || []).filter(t => t?.projectId === project.id);
                                const completedProjectTasks = projectTasks.filter(t => t?.status === 'Done').length;
                                const totalProjectTasks = projectTasks.length;
                                const taskProgress = totalProjectTasks > 0 ? (completedProjectTasks / totalProjectTasks) * 100 : 0;

                                return (
                                    <Card key={project.id} className="border-2">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-lg">{project.name}</CardTitle>
                                                    <CardDescription className="text-xs mt-1">
                                                        {projectTasks.length} task{projectTasks.length !== 1 ? 's' : ''} assigned
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div>
                                                <div className="flex items-center justify-between text-sm mb-2">
                                                    <span className="text-muted-foreground">Your Progress</span>
                                                    <span className="font-medium">{Math.round(taskProgress)}%</span>
                                                </div>
                                                <Progress value={taskProgress} className="h-2" />
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground">
                                                        {completedProjectTasks}/{totalProjectTasks} completed
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2 mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>My Tasks</CardTitle>
                        <CardDescription>Tasks assigned to you</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Task</TableHead>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(myTasks || []).slice(0, 5).map((task) => {
                                    if (!task?.id) return null;
                                    return (
                                        <TableRow key={task.id}>
                                            <TableCell className="font-medium">{task.title || 'Untitled Task'}</TableCell>
                                            <TableCell>{task.project?.name || 'Unknown'}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={task.status === 'Done' ? 'default' : 'secondary'}
                                                    className={cn(statusColors[task.status] || statusColors.ToDo)}
                                                >
                                                    {task.status === 'InProgress' ? 'In Progress' : task.status === 'ToDo' ? 'To Do' : 'Done'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {(!myTasks || myTasks.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                            No tasks assigned yet
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Evaluations</CardTitle>
                        <CardDescription>Feedback from your mentor</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {(myEvaluations || []).slice(0, 3).map((evaluation) => (
                                <div key={evaluation.id} className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-medium">{evaluation.mentorName}</span>
                                        <div className="flex items-center gap-1">
                                            <Award className="h-4 w-4 text-yellow-500" />
                                            <span className="font-bold">{evaluation.rating}/5</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{evaluation.feedback}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {new Date(evaluation.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                            {(!myEvaluations || myEvaluations.length === 0) && (
                                <div className="text-center text-muted-foreground py-8">
                                    No evaluations yet
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
