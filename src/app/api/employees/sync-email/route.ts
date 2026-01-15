import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Update employee email to match Firebase email
export async function POST(request: NextRequest) {
    try {
        // Buffer the request body
        const buffer = await request.arrayBuffer();
        const body = JSON.parse(new TextDecoder().decode(buffer));
        
        const { employeeId, newEmail } = body;

        if (!employeeId || !newEmail) {
            return NextResponse.json({ error: 'Employee ID and new email are required' }, { status: 400 });
        }

        // Check if new email is already in use
        const existingEmployee = await db.employee.findUnique({
            where: { email: newEmail },
        });

        if (existingEmployee && existingEmployee.id !== employeeId) {
            return NextResponse.json({ 
                error: 'Email already in use by another employee',
                code: 'EMAIL_IN_USE'
            }, { status: 409 });
        }

        const employee = await db.employee.update({
            where: { id: employeeId },
            data: { email: newEmail },
        });

        return NextResponse.json(employee);
    } catch (error) {
        console.error('Error updating employee email:', error);
        return NextResponse.json({ error: 'Failed to update email' }, { status: 500 });
    }
}
