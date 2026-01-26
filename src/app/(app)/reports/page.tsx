'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import {
  LoaderCircle,
  Users,
  FolderKanban,
  GraduationCap,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Calendar,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TaskStats = {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  completionRate: number;
};

type EmployeeReport = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  project: string;
  projects?: string[];
  taskStats: TaskStats;
  hoursLogged?: number;
};

type ProjectReport = {
  id: string;
  name: string;
  description?: string;
  teamSize: number;
  taskStats: TaskStats;
  members: Array<{
    id: string;
    name: string;
    type: 'Employee' | 'Intern';
    taskStats: TaskStats;
  }>;
};

type InternReport = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  university?: string;
  status: string;
  project: string;
  projects?: string[];
  taskStats: TaskStats;
  mentor?: {
    id: string;
    name: string;
  };
};

export default function ReportsPage() {
  const [loading, setLoading] = React.useState(true);
  const [employeeReports, setEmployeeReports] = React.useState<EmployeeReport[]>([]);
  const [projectReports, setProjectReports] = React.useState<ProjectReport[]>([]);
  const [internReports, setInternReports] = React.useState<InternReport[]>([]);
  const [selectedProject, setSelectedProject] = React.useState<string>('all');
  const [selectedRole, setSelectedRole] = React.useState<string>('all');
  const { toast } = useToast();

  React.useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      if (!res.ok) throw new Error('Failed to fetch reports');
      const data = await res.json();
      
      setEmployeeReports(data.employees || []);
      setProjectReports(data.projects || []);
      setInternReports(data.interns || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reports',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (type: 'employees' | 'projects' | 'interns') => {
    toast({
      title: 'Export Started',
      description: `Exporting ${type} report...`,
    });
    // Export functionality can be implemented here
  };

  // Filter employees
  const filteredEmployees = employeeReports.filter((emp) => {
    if (selectedProject !== 'all') {
      const empProjects = emp.projects || [emp.project];
      if (!empProjects.includes(selectedProject)) return false;
    }
    if (selectedRole !== 'all' && emp.role !== selectedRole) return false;
    return true;
  });

  // Filter interns
  const filteredInterns = internReports.filter((intern) => {
    if (selectedProject !== 'all') {
      const internProjects = intern.projects || [intern.project];
      if (!internProjects.includes(selectedProject)) return false;
    }
    return true;
  });

  // Get unique roles
  const roles = Array.from(new Set(employeeReports.map((e) => e.role)));

  // Get unique projects
  const projects = Array.from(
    new Set([
      ...employeeReports.flatMap((e) => e.projects || [e.project]),
      ...internReports.flatMap((i) => i.projects || [i.project]),
    ])
  ).filter((p) => p && p !== 'Unassigned');

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
        title="Reports & Analytics"
        description="Comprehensive reports on employees, projects, and interns"
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeeReports.length}</div>
            <p className="text-xs text-muted-foreground">
              Active team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectReports.length}</div>
            <p className="text-xs text-muted-foreground">
              Ongoing projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Interns</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{internReports.length}</div>
            <p className="text-xs text-muted-foreground">
              Current interns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employeeReports.length > 0
                ? Math.round(
                    employeeReports.reduce((acc, e) => acc + e.taskStats.completionRate, 0) /
                      employeeReports.length
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Overall task completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different reports */}
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employees">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Employees</span>
            <span className="sm:hidden">Emp</span>
          </TabsTrigger>
          <TabsTrigger value="projects">
            <FolderKanban className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Projects</span>
            <span className="sm:hidden">Proj</span>
          </TabsTrigger>
          <TabsTrigger value="interns">
            <GraduationCap className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Interns</span>
            <span className="sm:hidden">Int</span>
          </TabsTrigger>
        </TabsList>

        {/* Employee Reports */}
        <TabsContent value="employees" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Employee Performance Report</h3>
            <Button variant="outline" size="sm" onClick={() => handleExport('employees')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEmployees.map((employee) => (
              <Card key={employee.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={employee.avatarUrl} alt={employee.name} />
                        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{employee.name}</CardTitle>
                        <CardDescription className="text-xs">{employee.email}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline">{employee.role}</Badge>
                    <Badge variant="secondary" className="text-xs">
                      {employee.project}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completion Rate</span>
                      <span className="font-semibold">
                        {employee.taskStats.completionRate}%
                      </span>
                    </div>
                    <Progress value={employee.taskStats.completionRate} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        <span className="text-sm font-semibold">
                          {employee.taskStats.completed}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Done</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-yellow-600">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm font-semibold">
                          {employee.taskStats.inProgress}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Progress</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        <span className="text-sm font-semibold">
                          {employee.taskStats.todo}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">To Do</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEmployees.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No employees found matching the filters
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Project Reports */}
        <TabsContent value="projects" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Project Progress Report</h3>
            <Button variant="outline" size="sm" onClick={() => handleExport('projects')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="space-y-4">
            {projectReports.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FolderKanban className="h-5 w-5" />
                        {project.name}
                      </CardTitle>
                      {project.description && (
                        <CardDescription className="mt-1">
                          {project.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="whitespace-nowrap">
                        <Users className="h-3 w-3 mr-1" />
                        {project.teamSize} members
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Project Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold">{project.taskStats.total}</div>
                      <p className="text-xs text-muted-foreground">Total Tasks</p>
                    </div>
                    <div className="text-center p-3 bg-green-500/10 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {project.taskStats.completed}
                      </div>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {project.taskStats.inProgress}
                      </div>
                      <p className="text-xs text-muted-foreground">In Progress</p>
                    </div>
                    <div className="text-center p-3 bg-red-500/10 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {project.taskStats.todo}
                      </div>
                      <p className="text-xs text-muted-foreground">To Do</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Overall Progress</span>
                      <span className="font-semibold text-lg">
                        {project.taskStats.completionRate}%
                      </span>
                    </div>
                    <Progress value={project.taskStats.completionRate} className="h-3" />
                  </div>

                  {/* Team Members */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Team Performance</h4>
                    <div className="space-y-2">
                      {project.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-sm font-medium truncate">{member.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {member.type}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                              <span>{member.taskStats.completed}/{member.taskStats.total}</span>
                            </div>
                            <Badge
                              variant="secondary"
                              className={cn(
                                'text-xs',
                                member.taskStats.completionRate >= 75 && 'bg-green-500/20 text-green-700',
                                member.taskStats.completionRate >= 50 &&
                                  member.taskStats.completionRate < 75 &&
                                  'bg-yellow-500/20 text-yellow-700',
                                member.taskStats.completionRate < 50 && 'bg-red-500/20 text-red-700'
                              )}
                            >
                              {member.taskStats.completionRate}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {projectReports.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No projects found
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Intern Reports */}
        <TabsContent value="interns" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Intern Performance Report</h3>
            <Button variant="outline" size="sm" onClick={() => handleExport('interns')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredInterns.map((intern) => (
              <Card key={intern.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={intern.avatarUrl} alt={intern.name} />
                        <AvatarFallback>{intern.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{intern.name}</CardTitle>
                        <CardDescription className="text-xs">{intern.email}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground truncate">
                        {intern.university || 'University not specified'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{intern.status}</Badge>
                      <Badge variant="secondary" className="text-xs">
                        {intern.project}
                      </Badge>
                    </div>
                  </div>

                  {intern.mentor && (
                    <div className="text-xs text-muted-foreground">
                      Mentor: <span className="font-medium">{intern.mentor.name}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completion Rate</span>
                      <span className="font-semibold">
                        {intern.taskStats.completionRate}%
                      </span>
                    </div>
                    <Progress value={intern.taskStats.completionRate} className="h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        <span className="text-sm font-semibold">
                          {intern.taskStats.completed}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Done</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-yellow-600">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm font-semibold">
                          {intern.taskStats.inProgress}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">Progress</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        <span className="text-sm font-semibold">
                          {intern.taskStats.todo}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">To Do</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredInterns.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No interns found matching the filters
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
