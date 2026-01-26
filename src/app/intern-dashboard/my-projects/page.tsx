'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import {
  LoaderCircle,
  FolderKanban,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Project = {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
};

type Task = {
  id: string;
  title: string;
  status: 'ToDo' | 'InProgress' | 'Done';
  priority: string;
  dueDate?: string;
  projectId: string;
};

type TeamMember = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  type: 'Employee' | 'Intern';
  role?: string;
};

export default function InternMyProjectsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [internData, setInternData] = React.useState<any>(null);
  const [projectTeams, setProjectTeams] = React.useState<Record<string, TeamMember[]>>({});

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
        toast({
          title: 'Error',
          description: 'Intern profile not found',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      setInternData(currentIntern);

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
      if (!projectsRes.ok) throw new Error('Failed to fetch projects');
      
      const allProjects = await projectsRes.json();
      const myProjects = Array.isArray(allProjects)
        ? allProjects.filter((p: Project) => internProjects.includes(p.name))
        : [];
      
      setProjects(myProjects);

      // Fetch tasks for this intern
      const tasksRes = await fetch(`/api/tasks?internId=${currentIntern.id}`);
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      }

      // Fetch team members for each project
      const teamsData: Record<string, TeamMember[]> = {};
      for (const project of myProjects) {
        try {
          const teamRes = await fetch(`/api/projects/${encodeURIComponent(project.name)}/team-members`);
          if (teamRes.ok) {
            const teamData = await teamRes.json();
            teamsData[project.id] = teamData;
          }
        } catch (error) {
          console.error(`Error fetching team for ${project.name}:`, error);
        }
      }
      setProjectTeams(teamsData);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    const total = projectTasks.length;
    const completed = projectTasks.filter((t) => t.status === 'Done').length;
    const inProgress = projectTasks.filter((t) => t.status === 'InProgress').length;
    const todo = projectTasks.filter((t) => t.status === 'ToDo').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, todo, completionRate };
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
        title="My Projects"
        description="Projects you're currently working on"
      />

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Projects Assigned</h3>
            <p className="text-muted-foreground">
              You haven't been assigned to any projects yet. Contact your mentor for more information.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {projects.map((project) => {
            const stats = getProjectStats(project.id);
            const team = projectTeams[project.id] || [];

            return (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <FolderKanban className="h-5 w-5" />
                        {project.name}
                      </CardTitle>
                      {project.description && (
                        <CardDescription className="mt-2">
                          {project.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Your Progress</span>
                      <span className="font-semibold text-lg">{stats.completionRate}%</span>
                    </div>
                    <Progress value={stats.completionRate} className="h-3" />
                  </div>

                  {/* Task Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-3 bg-green-500/10 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-lg font-bold">{stats.completed}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Done</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-lg font-bold">{stats.inProgress}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">In Progress</p>
                    </div>
                    <div className="text-center p-3 bg-red-500/10 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-lg font-bold">{stats.todo}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">To Do</p>
                    </div>
                  </div>

                  {/* Project Dates */}
                  {(project.startDate || project.endDate) && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {project.startDate && new Date(project.startDate).toLocaleDateString()}
                          {project.startDate && project.endDate && ' - '}
                          {project.endDate && new Date(project.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Team Members */}
                  {team.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Team Members</span>
                        <Badge variant="outline" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          {team.length}
                        </Badge>
                      </div>
                      <div className="flex -space-x-2">
                        {team.slice(0, 5).map((member) => (
                          <Avatar
                            key={member.id}
                            className="h-8 w-8 border-2 border-background"
                            title={`${member.name} (${member.type})`}
                          >
                            <AvatarImage src={member.avatarUrl} alt={member.name} />
                            <AvatarFallback className="text-xs">
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {team.length > 5 && (
                          <div className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-medium">
                            +{team.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
