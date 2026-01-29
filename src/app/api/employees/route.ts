import { NextRequest, NextResponse } from 'next/server';
import { db, withRetry } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// GET all employees
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('active');
        
        let whereClause = {};
        if (activeOnly === 'true') {
            whereClause = { isActive: true };
        }

        const employees = await withRetry(async () => {
            return await db.employee.findMany({
                where: whereClause,
                orderBy: { enrollmentDate: 'desc' },
            });
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

// POST - Add new employee with automatic User account creation
export async function POST(request: NextRequest) {
    try {
        // Buffer the request body
        const buffer = await request.arrayBuffer();
        const body = JSON.parse(new TextDecoder().decode(buffer));

        const { name, email, phone, adrsId, role, project, avatarUrl } = body;

        if (!name || !email || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Personal email is what user entered
        const personalEmail = email.includes('@') ? email : `${email}@gmail.com`;

        // Check if employee already exists in database
        const existingEmployee = await db.employee.findFirst({
            where: {
                OR: [
                    { email: personalEmail },
                    ...(adrsId ? [{ adrsId: adrsId }] : []),
                ],
            },
        });

        if (existingEmployee) {
            return NextResponse.json({
                error: 'Employee with this email or ADRS ID already exists',
                code: 'DUPLICATE_EMAIL'
            }, { status: 409 });
        }

        // Generate default password: FirstName@123
        const firstName = name.split(' ')[0];
        const defaultPassword = `${firstName}@123`;
        const hashedPassword = await hashPassword(defaultPassword);

        // Create employee in database
        const employee = await db.employee.create({
            data: {
                name,
                email: personalEmail,
                phone: phone || null,
                adrsId: adrsId || null,
                role,
                project: project || 'Unassigned',
                avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
                enrollmentDate: new Date(),
            },
        });

        // Create User account for authentication
        await db.user.create({
            data: {
                email: personalEmail,
                name: name,
                passwordHash: hashedPassword,
                role: 'employee',
                employeeId: employee.id,
            },
        });

        return NextResponse.json({
            employee,
            credentials: {
                email: personalEmail,
                password: defaultPassword,
                message: `User account created. Login with email: ${personalEmail} and password: ${defaultPassword}`,
            }
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating employee:', error);

        if (error.code === 'P2002') {
            return NextResponse.json({
                error: 'Employee with this email or ADRS ID already exists',
                code: 'DUPLICATE_EMAIL'
            }, { status: 409 });
        }

        return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
    }
}
