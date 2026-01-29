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
import { Checkbox } from '@/components/ui/checkbox';
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
  Check,
  Edit,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

import { projectFormSchema, type ProjectFormValues } from '@/lib/form-validation';

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
  projectType?: 'Product' | 'Project';
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

  // Delete project dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [projectToDelete, setProjectToDelete] = React.useState<Project | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  // Bulk delete functionality
  const [selectedProjects, setSelectedProjects] = React.useState<Set<string>>(new Set());
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = React.useState(false);
  const [bulkDeleting, setBulkDeleting] = React.useState(false);

  // Edit project dialog
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [projectToEdit, setProjectToEdit] = React.useState<Project | null>(null);
  const [editing, setEditing] = React.useState(false);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | Project['status']>('all');
  const [typeFilter, setTypeFilter] = React.useState<'all' | 'Product' | 'Project'>('all');
  
  const [editProject, setEditProject] = React.useState({
    name: '',
    clientName: '',
    description: '',
    githubRepo: '',
    techStack: '',
    status: 'OnTrack' as Project['status'],
    progress: 0,
    projectType: 'Project' as 'Product' | 'Project',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });

  const [newProject, setNewProject] = React.useState({
    name: '',
    clientName: '',
    description: '',
    githubRepo: '',
    techStack: '',
    status: 'OnTrack' as Project['status'],
    projectType: 'Project' as 'Product' | 'Project',
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
      
      await res.json();
      await fetchProjects(); // Refresh all projects
      setCreateDialogOpen(false);
      setNewProject({
        name: '', clientName: '', description: '', githubRepo: '', techStack: '',
        status: 'OnTrack', projectType: 'Project', startDate: undefined, endDate: undefined,
      });
      toast({ title: 'Success', description: 'Project created successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create project', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const openEditDialog = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setProjectToEdit(project);
    setEditProject({
      name: project.name,
      clientName: project.clientName || '',
      description: project.description || '',
      githubRepo: project.githubRepo || '',
      techStack: project.techStack || '',
      status: project.status,
      progress: project.progress,
      projectType: project.projectType || 'Project',
      startDate: project.startDate ? new Date(project.startDate) : undefined,
      endDate: project.endDate ? new Date(project.endDate) : undefined,
    });
    setEditDialogOpen(true);
  };

  const handleEditProject = async () => {
    if (!projectToEdit || !editProject.name) {
      toast({ title: 'Error', description: 'Project name is required', variant: 'destructive' });
      return;
    }
    
    setEditing(true);
    try {
      const res = await fetch(`/api/projects/${projectToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editProject,
          startDate: editProject.startDate?.toISOString(),
          endDate: editProject.endDate?.toISOString(),
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update project');
      }
      
      await res.json();
      await fetchProjects(); // Refresh all projects
      
      // Update selected project if it's the one being edited
      if (selectedProject?.id === projectToEdit.id) {
        setSelectedProject(null);
      }
      
      setEditDialogOpen(false);
      setProjectToEdit(null);
      toast({ title: 'Success', description: 'Project updated successfully' });
    } catch (error: any) {
      console.error('Error updating project:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update project', 
        variant: 'destructive' 
      });
    } finally {
      setEditing(false);
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
      await res.json();
      await fetchProjectDetails(selectedProject.name); // Refresh project details
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
      await fetchProjectDetails(selectedProject.name); // Refresh project details
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
      const empRes = await fetch('/api/employees?active=true'); // Only fetch active employees
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
      await res.json();
      await fetchProjectDetails(selectedProject.name); // Refresh project details
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
      await fetchProjectDetails(selectedProject.name); // Refresh project details
      toast({ title: 'Success', description: 'Log deleted' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete log', variant: 'destructive' });
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectToDelete.id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete project');
      }
      
      const result = await res.json();
      
      // Close dialogs and refresh projects
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      if (selectedProject?.id === projectToDelete.id) {
        setSelectedProject(null);
      }
      
      await fetchProjects(); // Refresh projects list
      
      toast({ 
        title: 'Success', 
        description: `Project "${projectToDelete.name}" deleted successfully. ${result.deletedProject?.affectedEmployees || 0} employees and ${result.deletedProject?.affectedInterns || 0} interns were notified.`
      });
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to delete project', 
        variant: 'destructive' 
      });
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleBulkDelete = async () => {
    if (selectedProjects.size === 0) return;
    
    setBulkDeleting(true);
    try {
      const res = await fetch('/api/projects/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectIds: Array.from(selectedProjects) }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete projects');
      }
      
      const result = await res.json();
      
      // Close dialog and clear selection
      setBulkDeleteDialogOpen(false);
      setSelectedProjects(new Set());
      setSelectedProject(null);
      
      await fetchProjects(); // Refresh projects list
      
      toast({ 
        title: 'Bulk Delete Complete', 
        description: `${result.summary?.successful || 0} projects deleted successfully. ${result.summary?.affectedEmployees || 0} employees and ${result.summary?.affectedInterns || 0} interns were notified.`
      });
    } catch (error: any) {
      console.error('Error bulk deleting projects:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to delete projects', 
        variant: 'destructive' 
      });
    } finally {
      setBulkDeleting(false);
    }
  };

  const toggleProjectSelection = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelection = new Set(selectedProjects);
    if (newSelection.has(projectId)) {
      newSelection.delete(projectId);
    } else {
      newSelection.add(projectId);
    }
    setSelectedProjects(newSelection);
  };

  const selectAllProjects = () => {
    if (selectedProjects.size === filteredProjects.length) {
      setSelectedProjects(new Set());
    } else {
      setSelectedProjects(new Set(filteredProjects.map(p => p.id)));
    }
  };

  // Filter and search logic
  const filteredProjects = React.useMemo(() => {
    return projects.filter((project) => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.techStack?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

      // Type filter
      const matchesType = typeFilter === 'all' || project.projectType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [projects, searchQuery, statusFilter, typeFilter]);

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
        <div className="flex items-center gap-2">
          {selectedProjects.size > 0 && (
            <>
              <Button variant="outline" onClick={() => setSelectedProjects(new Set())}>
                Clear Selection ({selectedProjects.size})
              </Button>
              <Button variant="destructive" onClick={() => setBulkDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </>
          )}
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </PageHeader>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search projects by name, client, description, or tech stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={(value: 'all' | 'Product' | 'Project') => setTypeFilter(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Product">Product</SelectItem>
              <SelectItem value="Project">Project</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(value: 'all' | Project['status']) => setStatusFilter(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="OnTrack">On Track</SelectItem>
              <SelectItem value="AtRisk">At Risk</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all') && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setStatusFilter('all');
              }}
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Counter */}
      {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all') && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredProjects.length} of {projects.length} projects
            {searchQuery && ` matching "${searchQuery}"`}
            {typeFilter !== 'all' && ` • Type: ${typeFilter}`}
            {statusFilter !== 'all' && ` • Status: ${statusFilter}`}
          </p>
        </div>
      )}

      {/* Bulk Selection Controls */}
      {filteredProjects.length > 0 && (
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectedProjects.size === filteredProjects.length && filteredProjects.length > 0}
              onCheckedChange={selectAllProjects}
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              Select All ({filteredProjects.length} projects)
            </label>
          </div>
          {selectedProjects.size > 0 && (
            <Badge variant="secondary">
              {selectedProjects.size} selected
            </Badge>
          )}
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.isArray(filteredProjects) && filteredProjects.length > 0 ? filteredProjects.map((project) => {
          const StatusIcon = statusConfig[project?.status || 'OnTrack']?.icon || statusConfig.OnTrack.icon;
          return (
            <Card key={project?.id} className={cn(
              "hover:shadow-lg transition-shadow cursor-pointer group",
              selectedProjects.has(project?.id) && "ring-2 ring-primary"
            )} onClick={() => handleSelectProject(project)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={selectedProjects.has(project?.id)}
                      onCheckedChange={(checked) => toggleProjectSelection(project?.id, {} as React.MouseEvent)}
                      onClick={(e) => toggleProjectSelection(project?.id, e)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <CardTitle className="text-lg">{project?.name || 'Untitled'}</CardTitle>
                      {project?.clientName && <CardDescription className="mt-1">{project.clientName}</CardDescription>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn('text-xs', statusConfig[project?.status || 'OnTrack']?.color)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig[project?.status || 'OnTrack']?.label}
                    </Badge>
                    {project?.projectType && (
                      <Badge variant="secondary" className="text-xs">
                        {project.projectType}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                        onClick={(e) => openEditDialog(project, e)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => openDeleteDialog(project, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
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

      {/* Empty state for filtered results */}
      {Array.isArray(projects) && projects.length > 0 && filteredProjects.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No projects match your filters</h3>
            <p className="text-muted-foreground text-sm mb-4">Try adjusting your search or filter criteria</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setStatusFilter('all');
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}

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
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newProject.startDate ? format(newProject.startDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    setNewProject({ ...newProject, startDate: date });
                  }}
                  className="w-full"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newProject.endDate ? format(newProject.endDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    setNewProject({ ...newProject, endDate: date });
                  }}
                  className="w-full"
                />
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
            <div className="grid gap-2">
              <Label>Project Type</Label>
              <Select value={newProject.projectType} onValueChange={(v) => setNewProject({ ...newProject, projectType: v as 'Product' | 'Project' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Project">Project</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
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

      {/* Edit Project Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update project details and settings.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Project Name *</Label>
              <Input 
                id="edit-name" 
                value={editProject.name} 
                onChange={(e) => setEditProject({ ...editProject, name: e.target.value })} 
                placeholder="Project name" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-clientName">Client Name</Label>
              <Input 
                id="edit-clientName" 
                value={editProject.clientName} 
                onChange={(e) => setEditProject({ ...editProject, clientName: e.target.value })} 
                placeholder="Client or company name" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description" 
                value={editProject.description} 
                onChange={(e) => setEditProject({ ...editProject, description: e.target.value })} 
                placeholder="Project description" 
                rows={3} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-githubRepo">GitHub Repository URL</Label>
              <div className="flex gap-2">
                <Github className="h-5 w-5 mt-2 text-muted-foreground" />
                <Input 
                  id="edit-githubRepo" 
                  value={editProject.githubRepo} 
                  onChange={(e) => setEditProject({ ...editProject, githubRepo: e.target.value })} 
                  placeholder="https://github.com/username/repo" 
                  className="flex-1" 
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-techStack">Tech Stack</Label>
              <Input 
                id="edit-techStack" 
                value={editProject.techStack} 
                onChange={(e) => setEditProject({ ...editProject, techStack: e.target.value })} 
                placeholder="React, Node.js, PostgreSQL (comma separated)" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={editProject.startDate ? format(editProject.startDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    setEditProject({ ...editProject, startDate: date });
                  }}
                  className="w-full"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={editProject.endDate ? format(editProject.endDate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    setEditProject({ ...editProject, endDate: date });
                  }}
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Project Status</Label>
                <Select value={editProject.status} onValueChange={(v) => setEditProject({ ...editProject, status: v as Project['status'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OnTrack">On Track</SelectItem>
                    <SelectItem value="AtRisk">At Risk</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Project Type</Label>
                <Select value={editProject.projectType} onValueChange={(v) => setEditProject({ ...editProject, projectType: v as 'Product' | 'Project' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Project">Project</SelectItem>
                    <SelectItem value="Product">Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-progress">Progress (%)</Label>
              <Input
                id="edit-progress"
                type="number"
                min="0"
                max="100"
                value={editProject.progress}
                onChange={(e) => setEditProject({ ...editProject, progress: parseInt(e.target.value) || 0 })}
                placeholder="0-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={editing}>
              Cancel
            </Button>
            <Button onClick={handleEditProject} disabled={editing}>
              {editing ? <LoaderCircle className="h-4 w-4 animate-spin mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
              Update Project
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
                  {selectedProject.projectType && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedProject.projectType}
                    </Badge>
                  )}
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

      {/* Delete Project Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This action cannot be undone.
              <br /><br />
              <strong>This will permanently delete:</strong>
              <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                <li>All tasks and task submissions</li>
                <li>All daily logs</li>
                <li>All project documents</li>
                <li>All project assignments</li>
              </ul>
              <br />
              <strong>Affected users will be notified and unassigned from this project.</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProject} disabled={deleting}>
              {deleting ? <LoaderCircle className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Multiple Projects</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedProjects.size} project(s)? This action cannot be undone.
              <br /><br />
              <strong>This will permanently delete for each project:</strong>
              <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                <li>All tasks and task submissions</li>
                <li>All daily logs</li>
                <li>All project documents</li>
                <li>All project assignments</li>
              </ul>
              <br />
              <strong>All affected users will be notified and unassigned from these projects.</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteDialogOpen(false)} disabled={bulkDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleting}>
              {bulkDeleting ? <LoaderCircle className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete {selectedProjects.size} Projects
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
