import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get all daily logs for a project by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const project = await db.project.findUnique({
            where: { id },
            include: {
                dailyLogs: {
                    include: {
                        employee: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json(project.dailyLogs);
    } catch (error) {
        console.error('Error fetching daily logs:', error);
        return NextResponse.json({ error: 'Failed to fetch daily logs' }, { status: 500 });
    }
}

// POST - Add a new daily log to a project by ID
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { summary, hoursWorked, category, employeeId } = body;

        const project = await db.project.findUnique({
            where: { id },
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const dailyLog = await db.projectDailyLog.create({
            data: {
                projectId: project.id,
                employeeId,
                summary,
                hoursWorked: hoursWorked ? parseFloat(hoursWorked) : null,
                category: category || 'General',
            },
            include: {
                employee: true,
            },
        });

        return NextResponse.json(dailyLog, { status: 201 });
    } catch (error) {
        console.error('Error creating daily log:', error);
        return NextResponse.json({ error: 'Failed to create daily log' }, { status: 500 });
    }
}