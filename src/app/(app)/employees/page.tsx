'use client';

import * as React from 'react';
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
import { MoreHorizontal, PlusCircle, FileText, UserCog, Trash2, FolderKanban, Search, Upload, Users, LoaderCircle } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';

type Employee = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: 'Developer' | 'Designer' | 'Manager' | 'QA' | 'Admin';
  project: string;
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
  Admin: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/20',
};

const roles = ['Developer', 'Designer', 'Manager', 'QA', 'Admin'];

export default function EmployeesPage() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = React.useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState('');
  const [selectedTeam, setSelectedTeam] = React.useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterRole, setFilterRole] = React.useState<string>('all');
  const [filterProject, setFilterProject] = React.useState<string>('all');
  const { toast } = useToast();

  const [newEmployee, setNewEmployee] = React.useState({
    name: '',
    email: '',
    role: 'Developer',
    project: '',
    avatarUrl: '',
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
      setEmployees(empData);
      setProjects(projData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || emp.role === filterRole;
    const matchesProject = filterProject === 'all' || emp.project === filterProject;
    return matchesSearch && matchesRole && matchesProject;
  });

  const handleAddEmployee = async () => {
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
      });
      if (!res.ok) throw new Error('Failed to add employee');
      const data = await res.json();
      
      setEmployees((prev) => [data.employee, ...prev]);
      
      // Show success message with Firebase credentials
      if (data.firebase?.created) {
        toast({ 
          title: 'Success', 
          description: `${data.employee.name} has been added! Firebase account created with email: ${data.firebase.email} and password: ${data.firebase.password}`,
          duration: 10000, // Show for 10 seconds so user can read credentials
        });
      } else {
        toast({ 
          title: 'Success', 
          description: `${data.employee.name} has been added (Firebase account already exists)`,
        });
      }
      
      setAddDialogOpen(false);
      setNewEmployee({ name: '', email: '', role: 'Developer', project: '', avatarUrl: '' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add employee', variant: 'destructive' });
    }
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;
    try {
      const res = await fetch(`/api/employees/${selectedEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedEmployee),
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      toast({ title: 'Success', description: `${updated.name} has been updated` });
      setEditDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update employee', variant: 'destructive' });
    }
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    try {
      const res = await fetch(`/api/employees/${employee.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setEmployees((prev) => prev.filter((e) => e.id !== employee.id));
      toast({ title: 'Deleted', description: `${employee.name} has been removed`, variant: 'destructive' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete employee', variant: 'destructive' });
    }
  };

  const handleAssignProject = async () => {
    if (!selectedEmployee || !selectedProject) return;
    try {
      const res = await fetch(`/api/employees/${selectedEmployee.id}/assign-project`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: selectedProject }),
      });
      if (!res.ok) throw new Error('Failed to assign');
      const updated = await res.json();
      setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      toast({ title: 'Success', description: `Assigned to ${selectedProject}` });
      setAssignDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to assign project', variant: 'destructive' });
    }
  };

  const viewProjectTeam = async (projectName: string) => {
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(projectName)}/team`);
      const team = await res.json();
      setSelectedTeam(team);
      setSelectedProject(projectName);
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
                <TableHead>Role</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={employee.avatarUrl || undefined} alt={employee.name} />
                        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={roleColors[employee.role]}>
                      {employee.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{employee.project}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => viewProjectTeam(employee.project)}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      View Team
                    </Button>
                  </TableCell>
                  <TableCell>{new Date(employee.enrollmentDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setSelectedEmployee(employee); setSelectedProject(employee.project); setAssignDialogOpen(true); }}>
                          <FolderKanban className="mr-2 h-4 w-4" />Assign Project
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedEmployee({ ...employee }); setEditDialogOpen(true); }}>
                          <UserCog className="mr-2 h-4 w-4" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedEmployee(employee); setDetailsDialogOpen(true); }}>
                          <FileText className="mr-2 h-4 w-4" />View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.location.href = `/employees/${employee.id}/leave-quota`}>
                          <Users className="mr-2 h-4 w-4" />Manage Leave Quotas
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500" onClick={() => handleDeleteEmployee(employee)}>
                          <Trash2 className="mr-2 h-4 w-4" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Employee Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>Add a new team member to your organization.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Profile Image URL</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/photo.jpg"
                  value={newEmployee.avatarUrl}
                  onChange={(e) => setNewEmployee((prev) => ({ ...prev, avatarUrl: e.target.value }))}
                />
                <Avatar className="h-10 w-10">
                  <AvatarImage src={newEmployee.avatarUrl || undefined} />
                  <AvatarFallback><Upload className="h-4 w-4" /></AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input
                placeholder="Enter name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                placeholder="email@adrs.com"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select value={newEmployee.role} onValueChange={(v) => setNewEmployee((prev) => ({ ...prev, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (<SelectItem key={role} value={role}>{role}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Assign to Project</Label>
              <Select value={newEmployee.project} onValueChange={(v) => setNewEmployee((prev) => ({ ...prev, project: v }))}>
                <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                <SelectContent>
                  {projects.map((proj) => (<SelectItem key={proj.id} value={proj.name}>{proj.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddEmployee} disabled={!newEmployee.name || !newEmployee.email}>Add Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Profile Image URL</Label>
              <div className="flex gap-2">
                <Input
                  value={selectedEmployee?.avatarUrl || ''}
                  onChange={(e) => setSelectedEmployee((prev) => prev ? { ...prev, avatarUrl: e.target.value } : null)}
                />
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedEmployee?.avatarUrl || undefined} />
                  <AvatarFallback>{selectedEmployee?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={selectedEmployee?.name || ''} onChange={(e) => setSelectedEmployee((prev) => prev ? { ...prev, name: e.target.value } : null)} />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={selectedEmployee?.email || ''} onChange={(e) => setSelectedEmployee((prev) => prev ? { ...prev, email: e.target.value } : null)} />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select value={selectedEmployee?.role} onValueChange={(v) => setSelectedEmployee((prev) => prev ? { ...prev, role: v as Employee['role'] } : null)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (<SelectItem key={role} value={role}>{role}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateEmployee}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Project Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Project</DialogTitle>
            <DialogDescription>Assign {selectedEmployee?.name} to a project.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>
                {projects.map((proj) => (<SelectItem key={proj.id} value={proj.name}>{proj.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignProject}>Assign</Button>
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
              <div><p className="text-sm text-muted-foreground">Project</p><Badge variant="secondary">{selectedEmployee?.project}</Badge></div>
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
            <DialogTitle>Team: {selectedProject}</DialogTitle>
            <DialogDescription>{selectedTeam.length} team members</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {selectedTeam.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.avatarUrl || undefined} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
                <Badge variant="outline" className={roleColors[member.role]}>{member.role}</Badge>
              </div>
            ))}
          </div>
          <DialogFooter><Button onClick={() => setTeamDialogOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
