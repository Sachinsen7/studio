import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Update database schema for team lead functionality
export async function POST(request: NextRequest) {
    try {
        // This endpoint will help migrate existing data to support multiple team leads
        
        // 1. Get all employees who are currently team leads (have role = TeamLead)
        const teamLeads = await db.employee.findMany({
            where: { role: 'TeamLead' },
        });

        console.log(`Found ${teamLeads.length} team leads to migrate`);

        // 2. For each team lead, set their teamLeadProjects based on their current project assignment
        for (const teamLead of teamLeads) {
            const teamLeadProjects = [];
            
            // Add primary project if assigned
            if (teamLead.project && teamLead.project !== 'Unassigned') {
                teamLeadProjects.push(teamLead.project);
            }
            
            // Add projects from projects JSON array
            if (teamLead.projects) {
                try {
                    const projectsArray = JSON.parse(teamLead.projects);
                    if (Array.isArray(projectsArray)) {
                        teamLeadProjects.push(...projectsArray);
                    }
                } catch (error) {
                    console.error(`Error parsing projects for employee ${teamLead.id}:`, error);
                }
            }
            
            // Remove duplicates
            const uniqueTeamLeadProjects = [...new Set(teamLeadProjects)];
            
            // Update employee with team lead projects
            if (uniqueTeamLeadProjects.length > 0) {
                await db.employee.update({
                    where: { id: teamLead.id },
                    data: {
                        teamLeadProjects: JSON.stringify(uniqueTeamLeadProjects),
                    },
                });
                
                console.log(`Updated team lead ${teamLead.name} with projects: ${uniqueTeamLeadProjects.join(', ')}`);
            }
        }

        // 3. Update existing projects to use new ProjectType enum values
        // Get all projects with old enum values
        const projectsToUpdate = await db.project.findMany({
            where: {
                OR: [
                    { projectType: 'Company' as any },
                    { projectType: 'EmployeeSpecific' as any },
                ],
            },
        });

        console.log(`Found ${projectsToUpdate.length} projects to update`);

        // Update project types
        for (const project of projectsToUpdate) {
            let newProjectType: 'Product' | 'Project' = 'Project';
            
            // Map old values to new values
            if ((project.projectType as any) === 'Company') {
                newProjectType = 'Product'; // Company projects become Products
            } else if ((project.projectType as any) === 'EmployeeSpecific') {
                newProjectType = 'Project'; // Employee-specific projects remain Projects
            }
            
            await db.project.update({
                where: { id: project.id },
                data: { projectType: newProjectType },
            });
            
            console.log(`Updated project ${project.name} type to ${newProjectType}`);
        }

        return NextResponse.json({
            message: 'Schema migration completed successfully',
            teamLeadsUpdated: teamLeads.length,
            projectsUpdated: projectsToUpdate.length,
            details: {
                teamLeads: teamLeads.map(tl => ({
                    name: tl.name,
                    email: tl.email,
                    currentProject: tl.project,
                    allProjects: tl.projects,
                })),
                projects: projectsToUpdate.map(p => ({
                    name: p.name,
                    oldType: p.projectType,
                })),
            },
        });
    } catch (error) {
        console.error('Schema migration error:', error);
        return NextResponse.json(
            { 
                error: 'Schema migration failed', 
                details: error instanceof Error ? error.message : 'Unknown error' 
            },
            { status: 500 }
        );
    }
}