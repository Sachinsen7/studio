import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Assign project to employee
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        // Buffer the request body
        const buffer = await request.arrayBuffer();
        const body = JSON.parse(new TextDecoder().decode(buffer));
        
        const { project } = body;

        if (!project) {
            return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
        }

        // Verify the project exists
        const projectExists = await db.project.findUnique({
            where: { name: project },
        });

        if (!projectExists) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const employee = await db.employee.update({
            where: { id },
            data: { project },
        });

        return NextResponse.json(employee);
    } catch (error) {
        console.error('Error assigning project:', error);
        return NextResponse.json({ error: 'Failed to assign project' }, { status: 500 });
    }
}
