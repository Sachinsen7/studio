import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createNotification } from '@/lib/notification-utils';

// POST - Assign employee as team lead to projects
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { projectNames, action = 'add' } = body; // action: 'add', 'remove', 'replace'

        if (!Array.isArray(projectNames) || projectNames.length === 0) {
            return NextResponse.json(
                { error: 'Project names array is required' },
                { status: 400 }
            );
        }

        // Get employee
        const employee = await db.employee.findUnique({
            where: { id },
        });

        if (!employee) {
            return NextResponse.json(
                { error: 'Employee not found' },
                { status: 404 }
            );
        }

        // Verify all projects exist
        const projects = await db.project.findMany({
            where: {
                name: { in: projectNames },
            },
        });

        if (projects.length !== projectNames.length) {
            const foundProjectNames = projects.map(p => p.name);
            const missingProjects = projectNames.filter(name => !foundProjectNames.includes(name));
            return NextResponse.json(
                { error: `Projects not found: ${missingProjects.join(', ')}` },
                { status: 404 }
            );
        }

        // Get current team lead projects
        let currentTeamLeadProjects: string[] = [];
        if (employee.teamLeadProjects) {
            try {
                currentTeamLeadProjects = JSON.parse(employee.teamLeadProjects);
            } catch (error) {
                console.error('Error parsing team lead projects:', error);
                currentTeamLeadProjects = [];
            }
        }

        // Update team lead projects based on action
        let updatedTeamLeadProjects: string[] = [];
        
        switch (action) {
            case 'add':
                updatedTeamLeadProjects = [...new Set([...currentTeamLeadProjects, ...projectNames])];
                break;
            case 'remove':
                updatedTeamLeadProjects = currentTeamLeadProjects.filter(project => !projectNames.includes(project));
                break;
            case 'replace':
                updatedTeamLeadProjects = [...new Set(projectNames)];
                break;
            default:
                return NextResponse.json(
                    { error: 'Invalid action. Use: add, remove, or replace' },
                    { status: 400 }
                );
        }

        // Update employee role to TeamLead if they have team lead projects
        const shouldBeTeamLead = updatedTeamLeadProjects.length > 0;
        const newRole = shouldBeTeamLead ? 'TeamLead' : (employee.role === 'TeamLead' ? 'Developer' : employee.role);

        // Update employee
        const updatedEmployee = await db.employee.update({
            where: { id },
            data: {
                teamLeadProjects: updatedTeamLeadProjects.length > 0 ? JSON.stringify(updatedTeamLeadProjects) : null,
                role: newRole,
            },
        });

        // Send notification to employee
        try {
            if (employee.user?.id) {
                let notificationMessage = '';
                if (action === 'add') {
                    notificationMessage = `You have been assigned as Team Lead for: ${projectNames.join(', ')}`;
                } else if (action === 'remove') {
                    notificationMessage = `You have been removed as Team Lead from: ${projectNames.join(', ')}`;
                } else if (action === 'replace') {
                    notificationMessage = `Your Team Lead assignments have been updated to: ${projectNames.join(', ')}`;
                }

                await createNotification({
                    userId: employee.user.id,
                    type: 'project',
                    priority: 'high',
                    title: 'Team Lead Assignment Updated',
                    message: notificationMessage,
                    actionUrl: '/employee-dashboard/my-projects',
                    actionLabel: 'View Projects',
                });
            }
        } catch (notificationError) {
            console.error('Error sending notification:', notificationError);
        }

        return NextResponse.json({
            message: 'Team lead assignment updated successfully',
            employee: {
                id: updatedEmployee.id,
                name: updatedEmployee.name,
                email: updatedEmployee.email,
                role: updatedEmployee.role,
                teamLeadProjects: updatedTeamLeadProjects,
                previousTeamLeadProjects: currentTeamLeadProjects,
            },
            action,
            projectsAffected: projectNames,
        });
    } catch (error) {
        console.error('Error updating team lead assignment:', error);
        return NextResponse.json(
            { error: 'Failed to update team lead assignment' },
            { status: 500 }
        );
    }
}

// GET - Get team lead assignments for an employee
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const employee = await db.employee.findUnique({
            where: { id },
        });

        if (!employee) {
            return NextResponse.json(
                { error: 'Employee not found' },
                { status: 404 }
            );
        }

        let teamLeadProjects: string[] = [];
        if (employee.teamLeadProjects) {
            try {
                teamLeadProjects = JSON.parse(employee.teamLeadProjects);
            } catch (error) {
                console.error('Error parsing team lead projects:', error);
            }
        }

        // Get project details
        const projects = teamLeadProjects.length > 0 ? await db.project.findMany({
            where: {
                name: { in: teamLeadProjects },
            },
            select: {
                id: true,
                name: true,
                clientName: true,
                status: true,
                progress: true,
                projectType: true,
                startDate: true,
                endDate: true,
            },
        }) : [];

        return NextResponse.json({
            employee: {
                id: employee.id,
                name: employee.name,
                email: employee.email,
                role: employee.role,
            },
            teamLeadProjects: teamLeadProjects,
            projectDetails: projects,
            isTeamLead: employee.role === 'TeamLead',
            teamLeadProjectCount: teamLeadProjects.length,
        });
    } catch (error) {
        console.error('Error fetching team lead assignments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch team lead assignments' },
            { status: 500 }
        );
    }
}