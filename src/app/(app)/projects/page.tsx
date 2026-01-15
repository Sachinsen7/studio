'use client';

import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import {
  PlusCircle,
  Calendar as CalendarIcon,
  Users,
  ListTodo,
  FileText,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  Github,
  Upload,
  Trash2,
  Clock,
  ExternalLink,
  FileIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type Project = {
  id: string;
  name: string;
  clientName?: string;
  status: 'OnTrack' | 'AtRisk' | 'Completed';
  progress: number;
  startDate?: string;
  endDate?: string;
  description?: string;
  githubRepo?: string;
  techStack?: string;
  team?: { id: string; name: string; email: string; avatarUrl?: string; role: string }[];
  tasks?: { id: string; title: string; status: string }[];
  createdAt: string;
};

type ProjectDocument = {
  id: string;
  title: string;
  type: string;
  fileUrl?: string;
  fileName?: string;
  content?: string;
  uploadedBy: string;
  createdAt: string;
};

type DailyLog = {
  id: string;
  summary: string;
  hoursWorked?: number;
  category: string;
  date: string;
  employee: { id: string; name: string; avatarUrl?: string; role: string };
  createdAt: string;
};

const statusConfig = {
  OnTrack: { label: 'On Track', color: 'bg-green-500/10 text-green-600 border-green-200', icon: CheckCircle2 },
  AtRisk: { label: 'At Risk', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200', icon: AlertCircle },
  Completed: { label: 'Completed', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: CheckCircle2 },
};

const categoryColors: Record<string, string> = {
  General: 'bg-gray-500/10 text-gray-600',
  Environment: 'bg-green-500/10 text-green-600',
  Deployment: 'bg-blue-500/10 text-blue-600',
  BugFix: 'bg-red-500/10 text-red-600',
  Feature: 'bg-purple-500/10 text-purple-600',
  Documentation: 'bg-yellow-500/10 text-yellow-600',
  Meeting: 'bg-orange-500/10 text-orange-600',
  Review: 'bg-cyan-500/10 text-cyan-600',
};

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [documents, setDocuments] = React.useState<ProjectDocument[]>([]);
  const [dailyLogs, setDailyLogs] = React.useState<DailyLog[]>([]);
  const [loadingDocs, setLoadingDocs] = React.useState(false);
  const [loadingLogs, setLoadingLogs] = React.useState(false);
  
  // Add document dialog
  const [addDocDialogOpen, setAddDocDialogOpen] = React.useState(false);
  const [newDoc, setNewDoc] = React.useState({ title: '', type: 'General', fileUrl: '', content: '' });
  const [addingDoc, setAddingDoc] = React.useState(false);
  
  // Add log dialog
  const [addLogDialogOpen, setAddLogDialogOpen] = React.useState(false);
  const [newLog, setNewLog] = React.useState({ summary: '', hoursWorked: '', category: 'General' });
  const [addingLog, setAddingLog] = React.useState(false);

  const [newProject, setNewProject] = React.useState({
    name: '',
    clientName: '',
    description: '',
    githubRepo: '',
    techStack: '',
    status: 'OnTrack' as Project['status'],
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });
  const [creating, setCreating] = React.useState(false);
  
  const { toast } = useToast();

  React.useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({ title: 'Error', description: 'Failed to load projects', variant: 'destructive' });
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetails = async (projectName: string) => {
    setLoadingDocs(true);
    setLoadingLogs(true);
    try {
      const [docsRes, logsRes] = await Promise.all([
        fetch(`/api/projects/${encodeURIComponent(projectName)}/documents`),
        fetch(`/api/projects/${encodeURIComponent(projectName)}/daily-logs`),
      ]);
      const docsData = await docsRes.json();
      const logsData = await logsRes.json();
      setDocuments(Array.isArray(docsData) ? docsData : []);
      setDailyLogs(Array.isArray(logsData) ? logsData : []);
    } catch (error) {
      console.error('Error fetching project details:', error);
    } finally {
      setLoadingDocs(false);
      setLoadingLogs(false);
    }
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    fetchProjectDetails(project.name);
  };

  const handleCreateProject = async () => {
    if (!newProject.name) {
      toast({ title: 'Error', description: 'Project name is required', variant: 'destructive' });
      return;
    }
    
    setCreating(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProject,
          startDate: newProject.startDate?.toISOString(),
          endDate: newProject.endDate?.toISOString(),
        }),
      });
      
      if (!res.ok) throw new Error('Failed to create project');
      
      const createdProject = await res.json();
      setProjects([createdProject, ...(Array.isArray(projects) ? projects : [])]);
      setCreateDialogOpen(false);
      setNewProject({
        name: '', clientName: '', description: '', githubRepo: '', techStack: '',
        status: 'OnTrack', startDate: undefined, endDate: undefined,
      });
      toast({ title: 'Success', description: 'Project created successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create project', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleAddDocument = async () => {
    if (!selectedProject || !newDoc.title) return;
    setAddingDoc(true);
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(selectedProject.name)}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newDoc, uploadedBy: 'Admin' }),
      });
      if (!res.ok) throw new Error('Failed to add document');
      const doc = await res.json();
      setDocuments([doc, ...(Array.isArray(documents) ? documents : [])]);
      setAddDocDialogOpen(false);
      setNewDoc({ title: '', type: 'General', fileUrl: '', content: '' });
      toast({ title: 'Success', description: 'Document added successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add document', variant: 'destructive' });
    } finally {
      setAddingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!selectedProject) return;
    try {
      await fetch(`/api/projects/${encodeURIComponent(selectedProject.name)}/documents/${docId}`, { method: 'DELETE' });
      setDocuments(Array.isArray(documents) ? documents.filter(d => d?.id !== docId) : []);
      toast({ title: 'Success', description: 'Document deleted' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete document', variant: 'destructive' });
    }
  };

  const handleAddLog = async () => {
    if (!selectedProject || !newLog.summary) return;
    setAddingLog(true);
    try {
      // For admin, we'll use a placeholder employee ID - in real app, get from auth
      const empRes = await fetch('/api/employees');
      const employees = await empRes.json();
      const employeesArray = Array.isArray(employees) ? employees : [];
      const adminEmployee = employeesArray[0]; // Use first employee as placeholder
      
      if (!adminEmployee) {
        toast({ title: 'Error', description: 'No employees found', variant: 'destructive' });
        setAddingLog(false);
        return;
      }
      
      const res = await fetch(`/api/projects/${encodeURIComponent(selectedProject.name)}/daily-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newLog,
          employeeId: adminEmployee.id,
          hoursWorked: newLog.hoursWorked || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to add log');
      const log = await res.json();
      setDailyLogs([log, ...(Array.isArray(dailyLogs) ? dailyLogs : [])]);
      setAddLogDialogOpen(false);
      setNewLog({ summary: '', hoursWorked: '', category: 'General' });
      toast({ title: 'Success', description: 'Daily log added successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add daily log', variant: 'destructive' });
    } finally {
      setAddingLog(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!selectedProject) return;
    try {
      await fetch(`/api/projects/${encodeURIComponent(selectedProject.name)}/daily-logs/${logId}`, { method: 'DELETE' });
      setDailyLogs(Array.isArray(dailyLogs) ? dailyLogs.filter(l => l?.id !== logId) : []);
      toast({ title: 'Success', description: 'Log deleted' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete log', variant: 'destructive' });
    }
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
      <PageHeader title="Projects" description="Manage and track all your projects.">
        <Button onClick={() => setCreateDialogOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </PageHeader>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(projects) && projects.length > 0 ? projects.map((project) => {
          const StatusIcon = statusConfig[project?.status || 'OnTrack']?.icon || statusConfig.OnTrack.icon;
          return (
            <Card key={project?.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSelectProject(project)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project?.name || 'Untitled'}</CardTitle>
                    {project?.clientName && <CardDescription className="mt-1">{project.clientName}</CardDescription>}
                  </div>
                  <Badge variant="outline" className={cn('text-xs', statusConfig[project?.status || 'OnTrack']?.color)}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig[project?.status || 'OnTrack']?.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project?.progress || 0}%</span>
                  </div>
                  <Progress value={project?.progress || 0} className="h-2" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{Array.isArray(project?.team) ? project.team.length : 0} members</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <ListTodo className="h-4 w-4" />
                    <span>{Array.isArray(project?.tasks) ? project.tasks.length : 0} tasks</span>
                  </div>
                </div>
                {project?.githubRepo && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Github className="h-3 w-3" />
                    <span className="truncate">{project.githubRepo}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        }) : null}
      </div>

      {(!Array.isArray(projects) || projects.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Create your first project to get started</p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Project Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Add a new project with GitHub repo and documentation.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input id="name" value={newProject.name} onChange={(e) => setNewProject({ ...newProject, name: e.target.value })} placeholder="Project name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input id="clientName" value={newProject.clientName} onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })} placeholder="Client or company name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} placeholder="Project description" rows={3} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="githubRepo">GitHub Repository URL</Label>
              <div className="flex gap-2">
                <Github className="h-5 w-5 mt-2 text-muted-foreground" />
                <Input id="githubRepo" value={newProject.githubRepo} onChange={(e) => setNewProject({ ...newProject, githubRepo: e.target.value })} placeholder="https://github.com/username/repo" className="flex-1" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="techStack">Tech Stack</Label>
              <Input id="techStack" value={newProject.techStack} onChange={(e) => setNewProject({ ...newProject, techStack: e.target.value })} placeholder="React, Node.js, PostgreSQL (comma separated)" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={cn(
                        'justify-start text-left font-normal w-full', 
                        !newProject.startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newProject.startDate ? format(newProject.startDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start" side="bottom">
                    <Calendar 
                      mode="single" 
                      selected={newProject.startDate} 
                      onSelect={(date) => setNewProject({ ...newProject, startDate: date })} 
                      initialFocus 
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Popover modal={true}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={cn(
                        'justify-start text-left font-normal w-full', 
                        !newProject.endDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newProject.endDate ? format(newProject.endDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start" side="bottom">
                    <Calendar 
                      mode="single" 
                      selected={newProject.endDate} 
                      onSelect={(date) => setNewProject({ ...newProject, endDate: date })} 
                      initialFocus 
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Project Status</Label>
              <Select value={newProject.status} onValueChange={(v) => setNewProject({ ...newProject, status: v as Project['status'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OnTrack">On Track</SelectItem>
                  <SelectItem value="AtRisk">At Risk</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateProject} disabled={creating}>
              {creating ? <LoaderCircle className="h-4 w-4 animate-spin mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Details Sheet */}
      <Sheet open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
          {selectedProject && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {selectedProject.name}
                  {selectedProject.githubRepo && (
                    <a href={selectedProject.githubRepo} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                </SheetTitle>
                <SheetDescription>{selectedProject.clientName && <span>Client: {selectedProject.clientName}</span>}</SheetDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={cn('text-xs', statusConfig[selectedProject.status].color)}>
                    {statusConfig[selectedProject.status].label}
                  </Badge>
                  {selectedProject.techStack && (
                    <div className="flex gap-1 flex-wrap">
                      {selectedProject.techStack.split(',').map((tech, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{tech.trim()}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </SheetHeader>
              
              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="members">Members</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="logs">Daily Logs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedProject.description || 'No description provided'}</p>
                  </div>
                  {selectedProject.githubRepo && (
                    <div>
                      <h4 className="font-semibold mb-2">GitHub Repository</h4>
                      <a href={selectedProject.githubRepo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <Github className="h-4 w-4" />
                        {selectedProject.githubRepo}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold mb-2">Progress</h4>
                    <Progress value={selectedProject.progress} className="h-3" />
                    <p className="text-sm text-muted-foreground mt-1">{selectedProject.progress}% complete</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Users className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{selectedProject.team?.length || 0}</p><p className="text-sm text-muted-foreground">Team Members</p></div></div></CardContent></Card>
                    <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><ListTodo className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{selectedProject.tasks?.length || 0}</p><p className="text-sm text-muted-foreground">Total Tasks</p></div></div></CardContent></Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="members" className="space-y-3 mt-4">
                  {Array.isArray(selectedProject?.team) && selectedProject.team.length > 0 ? (
                    selectedProject.team.map((member) => (
                      <Card key={member?.id}><CardContent className="p-4"><div className="flex items-center gap-3"><Avatar className="h-10 w-10"><AvatarImage src={member?.avatarUrl} /><AvatarFallback>{member?.name?.charAt(0) || '?'}</AvatarFallback></Avatar><div className="flex-1"><p className="font-medium">{member?.name || 'Unknown'}</p><p className="text-sm text-muted-foreground">{member?.email || ''}</p></div><Badge variant="outline">{member?.role || 'Member'}</Badge></div></CardContent></Card>
                    ))
                  ) : <p className="text-sm text-muted-foreground text-center py-8">No team members assigned</p>}
                </TabsContent>
                
                <TabsContent value="tasks" className="space-y-3 mt-4">
                  {Array.isArray(selectedProject?.tasks) && selectedProject.tasks.length > 0 ? (
                    selectedProject.tasks.map((task) => (
                      <Card key={task?.id}><CardContent className="p-4"><div className="flex items-center justify-between"><p className="font-medium">{task?.title || 'Untitled'}</p><Badge variant="outline">{task?.status || 'Unknown'}</Badge></div></CardContent></Card>
                    ))
                  ) : <p className="text-sm text-muted-foreground text-center py-8">No tasks created yet</p>}
                </TabsContent>

                <TabsContent value="documents" className="mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Project Documents</h4>
                    <Button size="sm" onClick={() => setAddDocDialogOpen(true)}>
                      <Upload className="h-4 w-4 mr-2" />Add Document
                    </Button>
                  </div>
                  {loadingDocs ? (
                    <div className="flex justify-center py-8"><LoaderCircle className="h-6 w-6 animate-spin" /></div>
                  ) : Array.isArray(documents) && documents.length > 0 ? (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <Card key={doc?.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <FileIcon className="h-8 w-8 text-primary mt-1" />
                                <div>
                                  <p className="font-medium">{doc?.title || 'Untitled'}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">{doc?.type || 'General'}</Badge>
                                    <span className="text-xs text-muted-foreground">by {doc?.uploadedBy || 'Unknown'}</span>
                                    <span className="text-xs text-muted-foreground">{doc?.createdAt ? format(new Date(doc.createdAt), 'MMM dd, yyyy') : ''}</span>
                                  </div>
                                  {doc?.fileUrl && (
                                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-2">
                                      <ExternalLink className="h-3 w-3" />View File
                                    </a>
                                  )}
                                  {doc?.content && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{doc.content}</p>}
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteDocument(doc.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                      <Button size="sm" className="mt-3" onClick={() => setAddDocDialogOpen(true)}>
                        <Upload className="h-4 w-4 mr-2" />Upload First Document
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="logs" className="mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Daily Logs</h4>
                    <Button size="sm" onClick={() => setAddLogDialogOpen(true)}>
                      <PlusCircle className="h-4 w-4 mr-2" />Add Log
                    </Button>
                  </div>
                  {loadingLogs ? (
                    <div className="flex justify-center py-8"><LoaderCircle className="h-6 w-6 animate-spin" /></div>
                  ) : Array.isArray(dailyLogs) && dailyLogs.length > 0 ? (
                    <div className="space-y-3">
                      {dailyLogs.map((log) => (
                        <Card key={log?.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={log?.employee?.avatarUrl} />
                                  <AvatarFallback>{log?.employee?.name?.charAt(0) || '?'}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{log?.employee?.name || 'Unknown'}</p>
                                    <Badge variant="outline" className={cn('text-xs', categoryColors[log?.category || 'General'] || categoryColors.General)}>
                                      {log?.category || 'General'}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">{log?.summary || 'No summary'}</p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <CalendarIcon className="h-3 w-3" />
                                      {log?.date ? format(new Date(log.date), 'MMM dd, yyyy') : ''}
                                    </span>
                                    {log?.hoursWorked && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {log.hoursWorked} hrs
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteLog(log.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No daily logs yet</p>
                      <Button size="sm" className="mt-3" onClick={() => setAddLogDialogOpen(true)}>
                        <PlusCircle className="h-4 w-4 mr-2" />Add First Log
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Document Dialog */}
      <Dialog open={addDocDialogOpen} onOpenChange={setAddDocDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Document</DialogTitle>
            <DialogDescription>Upload a document or add a link to the project.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Title *</Label>
              <Input value={newDoc.title} onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })} placeholder="Document title" />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={newDoc.type} onValueChange={(v) => setNewDoc({ ...newDoc, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Environment">Environment Setup</SelectItem>
                  <SelectItem value="Documentation">Documentation</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>File URL (PDF, Doc, etc.)</Label>
              <Input value={newDoc.fileUrl} onChange={(e) => setNewDoc({ ...newDoc, fileUrl: e.target.value })} placeholder="https://example.com/document.pdf" />
              <p className="text-xs text-muted-foreground">Upload your file to a cloud service and paste the URL</p>
            </div>
            <div className="grid gap-2">
              <Label>Content / Notes</Label>
              <Textarea value={newDoc.content} onChange={(e) => setNewDoc({ ...newDoc, content: e.target.value })} placeholder="Additional notes or content..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDocDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddDocument} disabled={addingDoc}>
              {addingDoc ? <LoaderCircle className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              Add Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Daily Log Dialog */}
      <Dialog open={addLogDialogOpen} onOpenChange={setAddLogDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Daily Log</DialogTitle>
            <DialogDescription>Record what you worked on today for this project.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Summary *</Label>
              <Textarea value={newLog.summary} onChange={(e) => setNewLog({ ...newLog, summary: e.target.value })} placeholder="What did you work on today? (e.g., Updated environment variables, Fixed login bug...)" rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={newLog.category} onValueChange={(v) => setNewLog({ ...newLog, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Environment">Environment</SelectItem>
                    <SelectItem value="Deployment">Deployment</SelectItem>
                    <SelectItem value="BugFix">Bug Fix</SelectItem>
                    <SelectItem value="Feature">Feature</SelectItem>
                    <SelectItem value="Documentation">Documentation</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Review">Code Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Hours Worked</Label>
                <Input type="number" step="0.5" min="0" max="24" value={newLog.hoursWorked} onChange={(e) => setNewLog({ ...newLog, hoursWorked: e.target.value })} placeholder="e.g., 4.5" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddLogDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddLog} disabled={addingLog}>
              {addingLog ? <LoaderCircle className="h-4 w-4 animate-spin mr-2" /> : <PlusCircle className="h-4 w-4 mr-2" />}
              Add Log
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
