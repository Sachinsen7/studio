import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET team members for a project by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // First get the project to get its name
        const project = await db.project.findUnique({
            where: { id },
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Get team members using project name (since assignments are stored by name)
        const teamMembers = await db.employee.findMany({
            where: {
                OR: [
                    { project: project.name }, // Primary project
                    { projects: { contains: `"${project.name}"` } }, // Member of project (JSON array)
                ],
            },
            orderBy: { name: 'asc' },
        });

        // Also get interns assigned to this project
        const interns = await db.intern.findMany({
            where: {
                OR: [
                    { project: project.name },
                    { projects: { contains: `"${project.name}"` } },
                ],
            },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({
            employees: teamMembers,
            interns: interns,
            total: teamMembers.length + interns.length,
        });
    } catch (error) {
        console.error('Error fetching team:', error);
        return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
    }
}