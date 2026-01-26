import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/interns/[id]/assign-project - Assign projects to an intern
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { projects, primaryProject } = body;

        if (!projects || !Array.isArray(projects) || projects.length === 0) {
            return NextResponse.json(
                { error: 'At least one project must be selected' },
                { status: 400 }
            );
        }

        // Verify all projects exist
        const existingProjects = await db.project.findMany({
            where: {
                name: {
                    in: projects
                }
            }
        });

        if (existingProjects.length !== projects.length) {
            return NextResponse.json(
                { error: 'One or more projects do not exist' },
                { status: 400 }
            );
        }

        // Update intern with new project assignments
        const updatedIntern = await db.intern.update({
            where: { id },
            data: {
                project: primaryProject || projects[0], // Set primary project
                projects: JSON.stringify(projects), // Store all projects as JSON
            },
            include: {
                evaluations: {
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                }
            }
        });

        return NextResponse.json({
            message: 'Projects assigned successfully',
            intern: updatedIntern,
        });
    } catch (error: any) {
        console.error('Error assigning projects to intern:', error);
        
        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Intern not found' },
                { status: 404 }
            );
        }
        
        return NextResponse.json(
            { error: 'Failed to assign projects' },
            { status: 500 }
        );
    }
}