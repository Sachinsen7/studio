'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal, PlusCircle, FileText, UserCog, Trash2, FolderKanban, Search, Users, LoaderCircle, UserCheck, UserX, ImagePlus } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Form validation schema
const employeeFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  adrsId: z.string().optional(),
  role: z.enum(['Developer', 'Designer', 'Manager', 'QA']),
  project: z.string().optional(),
  avatarUrl: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

type Employee = {
  id: string;
  name: string;
  email: string;
  adrsId?: string | null;
  avatarUrl: string | null;
  role: 'Developer' | 'Designer' | 'Manager' | 'QA';
  project: string;
  projects?: string | null;
  isActive?: boolean;
  enrollmentDate: string;
};

type Project = {
  id: string;
  name: string;
  status: string;
  progress: number;
  team?: Employee[];
};

const roleColors: Record<string, string> = {
  Developer: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/20',
  Designer: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/20',
  Manager: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/20',
  QA: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/20',

};

const roles = ['Developer', 'Designer', 'Manager', 'QA'];

export default function EmployeesPage() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false);
  const [assigningProject, setAssigningProject] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = React.useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = React.useState(false);
  const [selectedProjects, setSelectedProjects] = React.useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = React.useState<Employee[]>([]);
  const [selectedTeamProject, setSelectedTeamProject] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterRole, setFilterRole] = React.useState<string>('all');
  const [filterProject, setFilterProject] = React.useState<string>('all');
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [previewImage, setPreviewImage] = React.useState<string>('');
  const { toast } = useToast();

  // Form for adding employee
  const addForm = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    mode: 'onChange', // Validate on change
    defaultValues: {
      name: '',
      email: '',
      adrsId: '',
      role: 'Developer',
      project: '',
      avatarUrl: '',
    },
  });

  // Form for editing employee
  const editForm = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    mode: 'onChange', // Validate on change
  });

  // Fetch employees and projects from API
  const fetchData = React.useCallback(async () => {
    try {
      const [empRes, projRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/projects'),
      ]);
      const empData = await empRes.json();
      const projData = await projRes.json();
      setEmployees(Array.isArray(empData) ? empData : []);
      setProjects(Array.isArray(projData) ? projData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
      setEmployees([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredEmployees = Array.isArray(employees) ? employees.filter((emp) => {
    const matchesSearch =
      emp?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || emp?.role === filterRole;
    const matchesProject = filterProject === 'all' || emp?.project === filterProject;
    return matchesSearch && matchesRole && matchesProject;
  }) : [];

  // Handle image upload
  const handleImageUpload = async (file: File, formType: 'add' | 'edit') => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      if (formType === 'add') {
        addForm.setValue('avatarUrl', data.url);
        setPreviewImage(data.url);
      } else {
        editForm.setValue('avatarUrl', data.url);
        if (selectedEmployee) {
          setSelectedEmployee({ ...selectedEmployee, avatarUrl: data.url });
        }
      }

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddEmployee = async (values: EmployeeFormValues) => {
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'DUPLICATE_EMAIL') {
          toast({
            title: 'Error',
            description: 'An employee with this email already exists',
            variant: 'destructive'
          });
        } else {
          throw new Error(data.error || 'Failed to add employee');
        }
        return;
      }

      await fetchData(); // Refresh all data from server

      // Show success message with Firebase credentials
      if (data?.firebase?.created) {
        toast({
          title: 'Success',
          description: `${data.employee.name} has been added! Firebase account created with email: ${data.firebase.email} and password: ${data.firebase.password}`,
          duration: 10000, // Show for 10 seconds so user can read credentials
        });
      } else {
        toast({
          title: 'Success',
          description: `${data.employee.name} has been added. ${data.firebase?.message || 'Firebase account already exists'}`,
        });
      }

      setAddDialogOpen(false);
      addForm.reset();
      setPreviewImage('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add employee',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateEmployee = async (values: EmployeeFormValues) => {
    if (!selectedEmployee) return;
    try {
      const res = await fetch(`/api/employees/${selectedEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      await fetchData(); // Refresh all data from server
      toast({ title: 'Success', description: `${updated?.name || 'Employee'} has been updated` });
      setEditDialogOpen(false);
      editForm.reset();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update employee', variant: 'destructive' });
    }
  };

  const handleToggleActive = async (employee: Employee) => {
    try {
      const newStatus = !employee.isActive;
      const res = await fetch(`/api/employees/${employee?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      await res.json();
      await fetchData(); // Refresh all data from server
      toast({
        title: newStatus ? 'Activated' : 'Deactivated',
        description: `${employee?.name || 'Employee'} has been ${newStatus ? 'activated' : 'deactivated'}`
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update employee status', variant: 'destructive' });
    }
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    try {
      const res = await fetch(`/api/employees/${employee?.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setEmployees((prev) => Array.isArray(prev) ? prev.filter((e) => e?.id !== employee?.id) : []);
      toast({ title: 'Deleted', description: `${employee?.name || 'Employee'} has been removed`, variant: 'destructive' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete employee', variant: 'destructive' });
    }
  };

  const handleAssignProject = async () => {
    if (!selectedEmployee || selectedProjects.length === 0) return;
    setAssigningProject(true);
    try {
      const res = await fetch(`/api/employees/${selectedEmployee.id}/assign-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projects: selectedProjects,
          project: selectedProjects[0] // Set primary project as first selected
        }),
      });
      if (!res.ok) throw new Error('Failed to assign');
      await res.json();
      await fetchData(); // Refresh all data from server
      toast({
        title: 'Success',
        description: `Assigned to ${selectedProjects.length} project${selectedProjects.length > 1 ? 's' : ''}`
      });
      setAssignDialogOpen(false);
      setSelectedProjects([]);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to assign project', variant: 'destructive' });
    } finally {
      setAssigningProject(false);
    }
  };

  const viewProjectTeam = async (projectName: string) => {
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectName)}/team`);
      const team = await res.json();
      setSelectedTeam(Array.isArray(team) ? team : []);
      setSelectedTeamProject(projectName);
      setTeamDialogOpen(true);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load team', variant: 'destructive' });
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
      <PageHeader title="Employee Management" description="Manage your team members and project assignments.">
        <Button onClick={() => setAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((proj) => (
                  <SelectItem key={proj.id} value={proj.name}>{proj.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>ADRS ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(filteredEmployees) && filteredEmployees.length > 0 ? filteredEmployees.map((employee) => (
                <TableRow
                  key={employee?.id}
                  className={cn(
                    employee?.isActive === false && "bg-red-500/5 opacity-60 hover:opacity-80"
                  )}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className={cn(
                          "h-10 w-10",
                          employee?.isActive === false && "grayscale"
                        )}>
                          <AvatarImage src={employee?.avatarUrl || undefined} alt={employee?.name || 'Employee'} />
                          <AvatarFallback>{employee?.name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        {employee?.isActive === false && (
                          <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-0.5">
                            <UserX className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            "font-medium",
                            employee?.isActive === false && "text-muted-foreground line-through"
                          )}>
                            {employee?.name || 'Unknown'}
                          </p>
                          {employee?.isActive === false && (
                            <Badge variant="outline" className="text-xs bg-red-500/20 text-red-700 border-red-300 dark:text-red-400">
                              Deactivated
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{employee?.email || ''}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {employee?.adrsId ? (
                      <code className="text-sm bg-primary/10 text-primary px-2 py-1 rounded font-mono">
                        {employee.adrsId}
                      </code>
                    ) : (
                      <span className="text-sm text-muted-foreground">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={roleColors[employee?.role || 'Developer']}>
                      {employee?.role || 'Developer'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(() => {
                        // Parse employee projects
                        let employeeProjects: string[] = [];
                        if (employee?.projects) {
                          try {
                            employeeProjects = JSON.parse(employee.projects);
                          } catch {
                            employeeProjects = employee?.project ? [employee.project] : [];
                          }
                        } else if (employee?.project && employee.project !== 'Unassigned') {
                          employeeProjects = [employee.project];
                        }

                        if (employeeProjects.length === 0) {
                          return <Badge variant="secondary">No Project</Badge>;
                        }

                        return employeeProjects.map((proj, index) => (
                          <Badge
                            key={proj}
                            variant={index === 0 ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {proj} {index === 0 && employeeProjects.length > 1 && "(Primary)"}
                          </Badge>
                        ));
                      })()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => viewProjectTeam(employee?.project || '')}
                      disabled={!employee?.project}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      View Team
                    </Button>
                  </TableCell>
                  <TableCell>{employee?.enrollmentDate ? new Date(employee.enrollmentDate).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedEmployee(employee);
                          // Initialize selected projects from employee's current projects
                          let currentProjects: string[] = [];
                          if (employee?.projects) {
                            try {
                              currentProjects = JSON.parse(employee.projects);
                            } catch {
                              currentProjects = employee?.project ? [employee.project] : [];
                            }
                          } else if (employee?.project && employee.project !== 'Unassigned') {
                            currentProjects = [employee.project];
                          }
                          setSelectedProjects(currentProjects);
                          setAssignDialogOpen(true);
                        }}>
                          <FolderKanban className="mr-2 h-4 w-4" />Assign Project
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedEmployee({ ...employee });
                          editForm.reset({
                            name: employee.name,
                            email: employee.email,
                            adrsId: employee.adrsId || '',
                            role: employee.role,
                            avatarUrl: employee.avatarUrl || '',
                          });
                          setEditDialogOpen(true);
                        }}>
                          <UserCog className="mr-2 h-4 w-4" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedEmployee(employee); setDetailsDialogOpen(true); }}>
                          <FileText className="mr-2 h-4 w-4" />View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/employees/${employee?.id}/leave-quota`}>
                            <Users className="mr-2 h-4 w-4" />Manage Leave Quotas
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(employee)}
                          className={employee?.isActive === false ? 'text-green-600' : 'text-orange-600'}
                        >
                          {employee?.isActive === false ? (
                            <><UserCheck className="mr-2 h-4 w-4" />Activate</>
                          ) : (
                            <><UserX className="mr-2 h-4 w-4" />Deactivate</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteEmployee(employee)}>
                          <Trash2 className="mr-2 h-4 w-4" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No employees found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Employee Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={(open) => {
        setAddDialogOpen(open);
        if (!open) {
          addForm.reset();
          setPreviewImage('');
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>Add a new team member to your organization.</DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddEmployee)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Profile Image Upload */}
                  <FormField
                    control={addForm.control}
                    name="avatarUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Image</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                              <AvatarImage src={previewImage || field.value || undefined} />
                              <AvatarFallback>
                                <ImagePlus className="h-8 w-8 text-muted-foreground" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageUpload(file, 'add');
                                  }
                                }}
                                disabled={uploadingImage}
                                className="cursor-pointer"
                              />
                              {uploadingImage && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <LoaderCircle className="h-3 w-3 animate-spin" />
                                  Uploading...
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                Max 5MB. JPG, PNG, GIF
                              </p>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Name */}
                  <FormField
                    control={addForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={addForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@adrs.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* ADRS ID */}
                  <FormField
                    control={addForm.control}
                    name="adrsId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ADRS ID (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="ADRS-001" {...field} />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">Unique employee identifier</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Role */}
                  <FormField
                    control={addForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Project */}
                  <FormField
                    control={addForm.control}
                    name="project"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign to Project</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select project (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.isArray(projects) && projects.length > 0 ? projects.map((proj) => (
                              <SelectItem key={proj.id} value={proj.name}>{proj.name}</SelectItem>
                            )) : (
                              <SelectItem value="no-projects" disabled>No projects available</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploadingImage || !addForm.formState.isValid}>
                  {uploadingImage ? 'Uploading...' : 'Add Employee'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        setEditDialogOpen(open);
        if (!open) {
          editForm.reset();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateEmployee)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Profile Image Upload */}
                  <FormField
                    control={editForm.control}
                    name="avatarUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profile Image</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                              <AvatarImage src={field.value || selectedEmployee?.avatarUrl || undefined} />
                              <AvatarFallback>
                                {selectedEmployee?.name?.charAt(0) || <ImagePlus className="h-8 w-8 text-muted-foreground" />}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageUpload(file, 'edit');
                                  }
                                }}
                                disabled={uploadingImage}
                                className="cursor-pointer"
                              />
                              {uploadingImage && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <LoaderCircle className="h-3 w-3 animate-spin" />
                                  Uploading...
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                Max 5MB. JPG, PNG, GIF
                              </p>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Name */}
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@adrs.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* ADRS ID */}
                  <FormField
                    control={editForm.control}
                    name="adrsId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ADRS ID (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="ADRS-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Role */}
                  <FormField
                    control={editForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role} value={role}>{role}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploadingImage || !editForm.formState.isValid}>
                  {uploadingImage ? 'Uploading...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Assign Project Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Projects</DialogTitle>
            <DialogDescription>
              Select multiple projects for {selectedEmployee?.name}. The first selected project will be the primary project.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 relative">
            {assigningProject && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Assigning projects...
                </div>
              </div>
            )}
            <Label className="text-sm font-medium mb-3 block">Available Projects</Label>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {Array.isArray(projects) && projects.length > 0 ? projects.map((project) => {
                const isChecked = selectedProjects.includes(project?.name || '');
                return (
                  <div key={project?.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={project?.id}
                      checked={isChecked}
                      disabled={assigningProject}
                      onCheckedChange={(checked) => {
                        const projectName = project?.name || '';
                        if (checked) {
                          setSelectedProjects(prev => [...prev, projectName]);
                        } else {
                          setSelectedProjects(prev => prev.filter(p => p !== projectName));
                        }
                      }}
                    />
                    <Label
                      htmlFor={project?.id}
                      className={cn(
                        "text-sm font-normal cursor-pointer flex-1",
                        assigningProject && "text-muted-foreground"
                      )}
                    >
                      {project?.name || 'Unnamed Project'}
                    </Label>
                  </div>
                );
              }) : (
                <p className="text-sm text-muted-foreground">No projects available</p>
              )}
            </div>
            {selectedProjects.length > 0 && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Selected Projects ({selectedProjects.length}):</p>
                <div className="flex flex-wrap gap-1">
                  {selectedProjects.map((projectName, index) => (
                    <span
                      key={projectName}
                      className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        index === 0
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      )}
                    >
                      {projectName} {index === 0 && "(Primary)"}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAssignDialogOpen(false);
                setSelectedProjects([]);
              }}
              disabled={assigningProject}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignProject}
              disabled={selectedProjects.length === 0 || assigningProject}
            >
              {assigningProject ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                  Assigning...
                </>
              ) : (
                <>Assign {selectedProjects.length > 0 && `(${selectedProjects.length})`}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Employee Details</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={selectedEmployee?.avatarUrl || undefined} />
                <AvatarFallback className="text-xl">{selectedEmployee?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{selectedEmployee?.name}</h3>
                <p className="text-muted-foreground">{selectedEmployee?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div><p className="text-sm text-muted-foreground">ID</p><p className="font-medium">{selectedEmployee?.id}</p></div>
              <div><p className="text-sm text-muted-foreground">Role</p><Badge variant="outline" className={roleColors[selectedEmployee?.role || 'Developer']}>{selectedEmployee?.role}</Badge></div>
              <div>
                <p className="text-sm text-muted-foreground">Projects</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(() => {
                    // Parse employee projects
                    let employeeProjects: string[] = [];
                    if (selectedEmployee?.projects) {
                      try {
                        employeeProjects = JSON.parse(selectedEmployee.projects);
                      } catch {
                        employeeProjects = selectedEmployee?.project ? [selectedEmployee.project] : [];
                      }
                    } else if (selectedEmployee?.project && selectedEmployee.project !== 'Unassigned') {
                      employeeProjects = [selectedEmployee.project];
                    }

                    if (employeeProjects.length === 0) {
                      return <Badge variant="secondary">No Projects</Badge>;
                    }

                    return employeeProjects.map((proj, index) => (
                      <Badge
                        key={proj}
                        variant={index === 0 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {proj} {index === 0 && employeeProjects.length > 1 && "(Primary)"}
                      </Badge>
                    ));
                  })()}
                </div>
              </div>
              <div><p className="text-sm text-muted-foreground">Joined</p><p className="font-medium">{selectedEmployee?.enrollmentDate && new Date(selectedEmployee.enrollmentDate).toLocaleDateString()}</p></div>
            </div>
          </div>
          <DialogFooter><Button onClick={() => setDetailsDialogOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Team Dialog */}
      <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Team: {selectedTeamProject}</DialogTitle>
            <DialogDescription>{selectedTeam.length} team members</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {Array.isArray(selectedTeam) && selectedTeam.length > 0 ? selectedTeam.map((member) => (
              <div key={member?.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member?.avatarUrl || undefined} />
                  <AvatarFallback>{member?.name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{member?.name || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">{member?.email || ''}</p>
                </div>
                <Badge variant="outline" className={roleColors[member?.role || 'Developer']}>{member?.role || 'Developer'}</Badge>
              </div>
            )) : (
              <p className="text-center py-4 text-muted-foreground">No team members found</p>
            )}
          </div>
          <DialogFooter><Button onClick={() => setTeamDialogOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
