import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all employees
export async function GET() {
    try {
        const employees = await db.employee.findMany({
            orderBy: { enrollmentDate: 'desc' },
        });
        return NextResponse.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
    }
}

// POST - Add new employee
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, role, project, avatarUrl } = body;

        if (!name || !email || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const employee = await db.employee.create({
            data: {
                name,
                email,
                role,
                project: project || 'Unassigned',
                avatarUrl: avatarUrl || `https://picsum.photos/seed/${name.toLowerCase().replace(/\s/g, '')}/100/100`,
                enrollmentDate: new Date(),
            },
        });

        return NextResponse.json(employee, { status: 201 });
    } catch (error) {
        console.error('Error creating employee:', error);
        return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
    }
}
