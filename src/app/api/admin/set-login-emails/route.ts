import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Set loginEmail for all employees who don't have one
export async function POST() {
    try {
        // Get all employees without loginEmail
        const employees = await db.employee.findMany({
            where: {
                loginEmail: null
            }
        });

        const updates = [];
        
        for (const emp of employees) {
            // Generate loginEmail from name (e.g., "Sapeksh Vishwakarma" -> "sapekshvishwakarma@adrs.com")
            const namePart = emp.name.toLowerCase().replace(/\s+/g, '');
            const loginEmail = `${namePart}@adrs.com`;
            
            try {
                const updated = await db.employee.update({
                    where: { id: emp.id },
                    data: { loginEmail }
                });
                updates.push({
                    id: emp.id,
                    name: emp.name,
                    loginEmail,
                    status: 'updated'
                });
            } catch (err: any) {
                updates.push({
                    id: emp.id,
                    name: emp.name,
                    loginEmail,
                    status: 'failed',
                    error: err.message
                });
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Processed ${employees.length} employees`,
            updates
        });
    } catch (error: any) {
        console.error('Error setting login emails:', error);
        return NextResponse.json({ 
            error: 'Failed to set login emails',
            details: error.message 
        }, { status: 500 });
    }
}

// GET - List all employees with their email status
export async function GET() {
    try {
        const employees = await db.employee.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                loginEmail: true,
                project: true
            }
        });

        return NextResponse.json(employees);
    } catch (error: any) {
        console.error('Error fetching employees:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch employees',
            details: error.message 
        }, { status: 500 });
    }
}
