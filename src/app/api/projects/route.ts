import { NextResponse } from 'next/server';
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
                    where: { project: project.name },
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
