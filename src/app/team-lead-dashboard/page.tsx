'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks/use-auth';
import { Users, ListTodo, Calendar, CheckCircle2, Clock, AlertCircle, LoaderCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  project: string;
  avatarUrl?: string;
};

type Task = {
  id: string;
  title: string;
  status: string;
  assignee: { name: string };
};

export default function TeamLeadDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [teamTasks, setTeamTasks] = React.useState<Task[]>([]);
  const [myProjects, setMyProjects] = React.useState<string[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      if (!user?.email) return;

      try {
        // Get current team lead info
        const empRes = await fetch(`/api/employees/me?email=${encodeURIComponent(user.email)}`);
        if (!empRes.ok) {
          setLoading(false);
          return;
        }

        const currentEmployee = await empRes.json();

        // Parse projects (support both single project and multiple projects)
        let projects: string[] = [];
        if (currentEmployee.projects) {
          try {
            projects = JSON.parse(currentEmployee.projects);
          } catch {
            projects = [currentEmployee.project];
          }
        } else if (currentEmployee.project && currentEmployee.project !== 'Unassigned') {
          projects = [currentEmployee.project];
        }

        setMyProjects(projects);

        // Fetch all employees to find team members
        const allEmpRes = await fetch('/api/employees?active=true'); // Only fetch active employees
        const allEmployees = await allEmpRes.json();

        // Filter team members (employees in the same projects, excluding self and inactive)
        const team = Array.isArray(allEmployees) ? allEmployees.filter((emp: any) => {
          if (emp.id === currentEmployee.id) return false;
          if (emp.isActive === false) return false;

          // Check if employee is in any of the team lead's projects
          let empProjects: string[] = [];
          if (emp.projects) {
            try {
              empProjects = JSON.parse(emp.projects);
            } catch {
              empProjects = [emp.project];
            }
          } else if (emp.project && emp.project !== 'Unassigned') {
            empProjects = [emp.project];
          }

          return projects.some(p => empProjects.includes(p));
        }) : [];

        setTeamMembers(team);

        // Fetch tasks for team members
        const tasksRes = await fetch('/api/tasks');
        const allTasks = await tasksRes.json();
        const teamTasksList = Array.isArray(allTasks) ? allTasks.filter((task: any) =>
          team.some((member: any) => member.id === task.assigneeId)
        ) : [];

        setTeamTasks(teamTasksList);
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.email]);

  const todoTasks = teamTasks.filter(t => t.status === 'ToDo').length;
  const inProgressTasks = teamTasks.filter(t => t.status === 'InProgress').length;
  const doneTasks = teamTasks.filter(t => t.status === 'Done').length;

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
        title="Team Lead Dashboard"
        description={`Managing ${teamMembers.length} team member${teamMembers.length !== 1 ? 's' : ''} across ${myProjects.length} project${myProjects.length !== 1 ? 's' : ''}`}
      />

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="relative transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{teamMembers.length}</div>
            <p className="text-xs text-muted-foreground">Active team members</p>
            <Link href="/team-lead-dashboard/my-team">
              <Button variant="ghost" size="sm" className="mt-2 w-full">
                View Team <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="relative transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">To Do</CardTitle>
            <Clock className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{todoTasks}</div>
            <p className="text-xs text-muted-foreground">Pending tasks</p>
          </CardContent>
        </Card>

        <Card className="relative transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">Active tasks</p>
          </CardContent>
        </Card>

        <Card className="relative transition-all hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{doneTasks}</div>
            <p className="text-xs text-muted-foreground">Finished tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* My Projects */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>My Projects</CardTitle>
          <CardDescription>Projects you're leading</CardDescription>
        </CardHeader>
        <CardContent>
          {myProjects.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {myProjects.map((project, index) => (
                <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                  {project}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No projects assigned</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/team-lead-dashboard/assign-task">
              <Button className="w-full justify-start">
                <ListTodo className="mr-2 h-4 w-4" />
                Assign Task to Team
              </Button>
            </Link>
            <Link href="/team-lead-dashboard/my-team">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Team Members
              </Button>
            </Link>
            <Link href="/team-lead-dashboard/team-attendance">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                View Team Attendance
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Team Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Team Tasks</CardTitle>
            <CardDescription>Latest tasks assigned to your team</CardDescription>
          </CardHeader>
          <CardContent>
            {teamTasks.length > 0 ? (
              <div className="space-y-3">
                {teamTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.assignee?.name}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        task.status === 'Done' && 'bg-green-500/10 text-green-600 border-green-200',
                        task.status === 'InProgress' && 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
                        task.status === 'ToDo' && 'bg-red-500/10 text-red-600 border-red-200'
                      )}
                    >
                      {task.status === 'InProgress' ? 'In Progress' : task.status === 'ToDo' ? 'To Do' : 'Done'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No tasks assigned yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
