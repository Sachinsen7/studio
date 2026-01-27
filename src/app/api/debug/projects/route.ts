import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Debug endpoint to check projects and test updates
export async function GET() {
    try {
        const projects = await db.project.findMany({
            select: {
                id: true,
                name: true,
                status: true,
                progress: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        return NextResponse.json({
            message: 'Debug info for projects',
            projectCount: projects.length,
            projects: projects,
            sampleProjectId: projects.length > 0 ? projects[0].id : null,
        });
    } catch (error) {
        console.error('Debug error:', error);
        return NextResponse.json(
            { error: 'Debug failed', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// Test update endpoint
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { projectId, testData } = body;

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID required' }, { status: 400 });
        }

        // First check if project exists
        const existingProject = await db.project.findUnique({
            where: { id: projectId },
        });

        if (!existingProject) {
            return NextResponse.json({ 
                error: 'Project not found',
                projectId,
                message: 'The specified project ID does not exist in the database'
            }, { status: 404 });
        }

        // Try to update the project
        const updatedProject = await db.project.update({
            where: { id: projectId },
            data: {
                description: testData?.description || 'Debug test update',
                progress: testData?.progress || existingProject.progress,
            },
        });

        return NextResponse.json({
            message: 'Debug update successful',
            originalProject: existingProject,
            updatedProject: updatedProject,
        });
    } catch (error) {
        console.error('Debug update error:', error);
        return NextResponse.json(
            { 
                error: 'Debug update failed', 
                details: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}