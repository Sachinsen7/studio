import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET current employee by email (checks both loginEmail and email)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Search by loginEmail first (Firebase login), then by personal email
        const employee = await db.employee.findFirst({
            where: {
                OR: [
                    { loginEmail: email },
                    { email: email },
                ],
            },
            include: {
                tasks: {
                    include: {
                        project: true,
                    },
                },
                leaveRequests: true,
            },
        });

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        return NextResponse.json(employee);
    } catch (error) {
        console.error('Error fetching employee:', error);
        return NextResponse.json({ error: 'Failed to fetch employee' }, { status: 500 });
    }
}
