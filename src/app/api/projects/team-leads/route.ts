import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get all team leads and their assigned projects
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const projectName = searchParams.get('projectName');

        if (projectName) {
            // Get team leads for a specific project
            const employees = await db.employee.findMany({
                where: {
                    AND: [
                        { role: 'TeamLead' },
                        {
                            OR: [
                                { teamLeadProjects: { contains: `"${projectName}"` } },
                                { project: projectName }, // Fallback for legacy data
                            ],
                        },
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    role: true,
                    teamLeadProjects: true,
                    project: true,
                },
            });

            return NextResponse.json({
                projectName,
                teamLeads: employees.map(emp => ({
                    ...emp,
                    teamLeadProjects: emp.teamLeadProjects ? JSON.parse(emp.teamLeadProjects) : [],
                })),
                count: employees.length,
            });
        } else {
            // Get all team leads and their projects
            const teamLeads = await db.employee.findMany({
                where: { role: 'TeamLead' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true,
                    role: true,
                    teamLeadProjects: true,
                    project: true,
                },
                orderBy: { name: 'asc' },
            });

            // Parse team lead projects and get project details
            const teamLeadsWithProjects = await Promise.all(
                teamLeads.map(async (teamLead) => {
                    let teamLeadProjectNames: string[] = [];
                    
                    if (teamLead.teamLeadProjects) {
                        try {
                            teamLeadProjectNames = JSON.parse(teamLead.teamLeadProjects);
                        } catch (error) {
                            console.error(`Error parsing team lead projects for ${teamLead.id}:`, error);
                        }
                    }

                    // Get project details
                    const projects = teamLeadProjectNames.length > 0 ? await db.project.findMany({
                        where: {
                            name: { in: teamLeadProjectNames },
                        },
                        select: {
                            id: true,
                            name: true,
                            clientName: true,
                            status: true,
                            progress: true,
                            projectType: true,
                        },
                    }) : [];

                    return {
                        ...teamLead,
                        teamLeadProjectNames,
                        projects,
                        projectCount: projects.length,
                    };
                })
            );

            return NextResponse.json({
                teamLeads: teamLeadsWithProjects,
                totalTeamLeads: teamLeadsWithProjects.length,
                totalProjects: teamLeadsWithProjects.reduce((sum, tl) => sum + tl.projectCount, 0),
            });
        }
    } catch (error) {
        console.error('Error fetching team leads:', error);
        return NextResponse.json(
            { error: 'Failed to fetch team leads' },
            { status: 500 }
        );
    }
}