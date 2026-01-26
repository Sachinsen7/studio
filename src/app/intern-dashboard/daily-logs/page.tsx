'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useLoading, LoadingButton } from '@/hooks/use-loading';
import { useApiClient } from '@/lib/api-client';
import {
  LoaderCircle,
  PlusCircle,
  Clock,
  Calendar,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';

type DailyLog = {
  id: string;
  summary: string;
  hoursWorked?: number;
  category: string;
  date: string;
  projectName: string;
  createdAt: string;
};

type Project = {
  id: string;
  name: string;
};

export default function InternDailyLogsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const apiClient = useApiClient();
  const { isLoading } = useLoading();
  const [loading, setLoading] = React.useState(true);
  const [logs, setLogs] = React.useState<DailyLog[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [internId, setInternId] = React.useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [newLog, setNewLog] = React.useState({
    projectName: '',
    summary: '',
    hoursWorked: '',
    category: 'General',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  React.useEffect(() => {
    fetchData();
  }, [user?.email]);

  const fetchData = async () => {
    if (!user?.email) return;

    try {
      // Get intern data
      const internRes = await fetch(`/api/interns?email=${encodeURIComponent(user.email)}`);
      if (!internRes.ok) throw new Error('Failed to fetch intern data');
      
      const interns = await internRes.json();
      const currentIntern = Array.isArray(interns) ? interns.find((i: any) => i.email === user.email) : null;
      
      if (!currentIntern) {
        setLoading(false);
        return;
      }

      setInternId(currentIntern.id);

      // Parse intern's projects
      let internProjects: string[] = [];
      if (currentIntern.projects) {
        try {
          internProjects = JSON.parse(currentIntern.projects);
        } catch {
          internProjects = [currentIntern.project];
        }
      } else if (currentIntern.project && currentIntern.project !== 'Unassigned') {
        internProjects = [currentIntern.project];
      }

      // Fetch all projects
      const projectsRes = await fetch('/api/projects');
      if (projectsRes.ok) {
        const allProjects = await projectsRes.json();
        const myProjects = Array.isArray(allProjects)
          ? allProjects.filter((p: Project) => internProjects.includes(p.name))
          : [];
        setProjects(myProjects);
        
        if (myProjects.length > 0) {
          setNewLog(prev => ({ ...prev, projectName: myProjects[0].name }));
        }
      }

      // Fetch daily logs for all intern's projects
      const allLogs: DailyLog[] = [];
      for (const projectName of internProjects) {
        try {
          const logsRes = await fetch(`/api/projects/${encodeURIComponent(projectName)}/daily-logs`);
          if (logsRes.ok) {
            const logsData = await logsRes.json();
            if (Array.isArray(logsData)) {
              // Filter logs by this intern
              const internLogs = logsData.filter((log: any) => log.employeeId === currentIntern.id);
              allLogs.push(...internLogs);
            }
          }
        } catch (error) {
          console.error(`Error fetching logs for ${projectName}:`, error);
        }
      }
      
      setLogs(allLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load daily logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async () => {
    if (!newLog.projectName || !newLog.summary) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const result = await apiClient.post(
      `/api/projects/${encodeURIComponent(newLog.projectName)}/daily-logs`,
      {
        ...newLog,
        employeeId: internId,
        hoursWorked: newLog.hoursWorked ? parseFloat(newLog.hoursWorked) : null,
      },
      {
        loadingKey: 'add-daily-log',
        successMessage: 'Daily log added successfully',
        showSuccessToast: true,
        onSuccess: () => {
          setAddDialogOpen(false);
          setNewLog({
            projectName: projects[0]?.name || '',
            summary: '',
            hoursWorked: '',
            category: 'General',
            date: format(new Date(), 'yyyy-MM-dd'),
          });
          fetchData();
        },
      }
    );
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
        title="Daily Logs"
        description="Track your daily work and progress"
      >
        <Button onClick={() => setAddDialogOpen(true)} disabled={projects.length === 0}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Log
        </Button>
      </PageHeader>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Projects Assigned</h3>
            <p className="text-muted-foreground">
              You need to be assigned to a project before you can add daily logs.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{log.projectName}</Badge>
                      <Badge variant="secondary">{log.category}</Badge>
                    </div>
                    <CardTitle className="text-base">{log.summary}</CardTitle>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(log.date), 'MMM dd, yyyy')}
                    </div>
                    {log.hoursWorked && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-4 w-4" />
                        {log.hoursWorked}h
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}

          {logs.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Daily Logs Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your daily work by adding your first log.
                </p>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Your First Log
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Add Log Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Daily Log</DialogTitle>
            <DialogDescription>Record your daily work and progress</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Project *</Label>
              <Select value={newLog.projectName} onValueChange={(v) => setNewLog({ ...newLog, projectName: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.name}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={newLog.date}
                onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Summary *</Label>
              <Textarea
                placeholder="What did you work on today?"
                value={newLog.summary}
                onChange={(e) => setNewLog({ ...newLog, summary: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Hours Worked</Label>
                <Input
                  type="number"
                  step="0.5"
                  placeholder="8"
                  value={newLog.hoursWorked}
                  onChange={(e) => setNewLog({ ...newLog, hoursWorked: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newLog.category} onValueChange={(v) => setNewLog({ ...newLog, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Development">Development</SelectItem>
                    <SelectItem value="Testing">Testing</SelectItem>
                    <SelectItem value="Documentation">Documentation</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Learning">Learning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <LoadingButton
              onClick={handleAddLog}
              loading={isLoading('add-daily-log')}
              loadingText="Adding..."
            >
              Add Log
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
