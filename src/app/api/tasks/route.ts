import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all tasks
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const assigneeId = searchParams.get('assigneeId');
        const projectId = searchParams.get('projectId');

        const where: Record<string, unknown> = {};
        if (assigneeId) where.assigneeId = assigneeId;
        if (projectId) where.projectId = projectId;

        const tasks = await db.task.findMany({
            where,
            include: {
                assignee: true,
                project: true,
                submissions: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

// POST - Create new task
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, assigneeId, projectId, status } = body;

        if (!title || !assigneeId || !projectId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const task = await db.task.create({
            data: {
                title,
                description,
                assigneeId,
                projectId,
                status: status || 'ToDo',
            },
            include: {
                assignee: true,
                project: true,
            },
        });

        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}
