'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import { useAuth } from '@/hooks/use-auth';
import { LoaderCircle, Mail, Briefcase } from 'lucide-react';

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  project: string;
  projects?: string;
  avatarUrl?: string;
};

const roleColors: Record<string, string> = {
  Developer: 'bg-blue-500/20 text-blue-600',
  Designer: 'bg-purple-500/20 text-purple-600',
  QA: 'bg-green-500/20 text-green-600',
  Manager: 'bg-red-500/20 text-red-600',
};

export default function MyTeamPage() {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [myProjects, setMyProjects] = React.useState<string[]>([]);

  React.useEffect(() => {
    const fetchTeam = async () => {
      if (!user?.email) return;

      try {
        // Get current team lead info
        const empRes = await fetch(`/api/employees/me?email=${encodeURIComponent(user.email)}`);
        if (!empRes.ok) {
          setLoading(false);
          return;
        }

        const currentEmployee = await empRes.json();

        // Parse projects
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

        // Fetch all employees
        const allEmpRes = await fetch('/api/employees?active=true'); // Only fetch active employees
        const allEmployees = await allEmpRes.json();

        // Filter team members
        const team = Array.isArray(allEmployees) ? allEmployees.filter((emp: any) => {
          if (emp.id === currentEmployee.id) return false;
          if (emp.isActive === false) return false;

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
      } catch (error) {
        console.error('Error fetching team:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [user?.email]);

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
        title="My Team"
        description={`${teamMembers.length} team member${teamMembers.length !== 1 ? 's' : ''} across ${myProjects.length} project${myProjects.length !== 1 ? 's' : ''}`}
      />

      {myProjects.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>My Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {myProjects.map((project, index) => (
                <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                  {project}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map((member) => {
          // Parse member projects
          let memberProjects: string[] = [];
          if (member.projects) {
            try {
              memberProjects = JSON.parse(member.projects);
            } catch {
              memberProjects = [member.project];
            }
          } else if (member.project && member.project !== 'Unassigned') {
            memberProjects = [member.project];
          }

          return (
            <Card key={member.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarImage src={member.avatarUrl} />
                    <AvatarFallback className="text-lg">{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <Badge
                    variant="outline"
                    className={`mt-2 ${roleColors[member.role] || 'bg-gray-500/20 text-gray-600'}`}
                  >
                    {member.role}
                  </Badge>

                  <div className="w-full mt-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {memberProjects.map((proj, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {proj}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {teamMembers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground">No team members found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Team members will appear here when they're assigned to your projects
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}
