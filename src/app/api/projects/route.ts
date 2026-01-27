import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all projects with team members
export async function GET() {
    try {
        const projects = await db.project.findMany({
            include: {
                tasks: {
                    include: {
                        assignee: true,
                    },
                },
            },
            orderBy: { name: 'asc' },
        });

        // Get employees for each project
        const projectsWithTeams = await Promise.all(
            projects.map(async (project) => {
                const teamMembers = await db.employee.findMany({
                    where: {
                        OR: [
                            { project: project.name }, // Primary project
                            { projects: { contains: `"${project.name}"` } }, // Member of project (JSON array)
                        ],
                    },
                });
                return {
                    ...project,
                    team: teamMembers,
                };
            })
        );

        return NextResponse.json(projectsWithTeams);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

// POST - Create new project
export async function POST(request: NextRequest) {
    try {
        // Buffer the request body
        const buffer = await request.arrayBuffer();
        const body = JSON.parse(new TextDecoder().decode(buffer));
        
        const { name, clientName, description, status, startDate, endDate, githubRepo, techStack, projectType } = body;

        if (!name) {
            return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
        }

        const project = await db.project.create({
            data: {
                name,
                clientName,
                description,
                status: status || 'OnTrack',
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                githubRepo,
                techStack,
                projectType: projectType || 'Project', // Default to 'Project'
                progress: 0,
            },
            include: {
                tasks: true,
            },
        });

        return NextResponse.json({ ...project, team: [] }, { status: 201 });
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}
