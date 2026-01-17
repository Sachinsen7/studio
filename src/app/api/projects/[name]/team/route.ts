import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET team members for a project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const { name } = await params;
        const projectName = decodeURIComponent(name);

        const teamMembers = await db.employee.findMany({
            where: {
                OR: [
                    { project: projectName }, // Primary project
                    { projects: { contains: `"${projectName}"` } }, // Member of project (JSON array)
                ],
            },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(teamMembers);
    } catch (error) {
        console.error('Error fetching team:', error);
        return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
    }
}
