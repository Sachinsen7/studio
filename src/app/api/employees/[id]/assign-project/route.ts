import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Assign project to employee
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { project } = body;

        if (!project) {
            return NextResponse.json({ error: 'Project is required' }, { status: 400 });
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
