import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createFirebaseUser } from '@/lib/firebase-admin';

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

// POST - Add new employee with automatic Firebase account creation
export async function POST(request: NextRequest) {
    try {
        // Buffer the request body
        const buffer = await request.arrayBuffer();
        const body = JSON.parse(new TextDecoder().decode(buffer));
        
        const { name, email, adrsId, role, project, avatarUrl } = body;

        if (!name || !email || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate Firebase login email (name@adrs.com format)
        const namePart = name.toLowerCase().replace(/\s+/g, '');
        const loginEmail = `${namePart}@adrs.com`;
        const defaultPassword = 'password'; // Default password for all new employees
        
        // Personal email is what user entered
        const personalEmail = email.includes('@') ? email : `${email}@gmail.com`;

        // Check if employee already exists in database (by personal email, login email, or ADRS ID)
        const existingEmployee = await db.employee.findFirst({
            where: {
                OR: [
                    { email: personalEmail },
                    { loginEmail: loginEmail },
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

        // Create Firebase account with login email
        let firebaseResult;
        let firebaseCreated = false;
        try {
            firebaseResult = await createFirebaseUser(loginEmail, defaultPassword, name);
            
            if (!firebaseResult.success) {
                console.warn(`Firebase account already exists for ${loginEmail}`);
            } else {
                firebaseCreated = true;
            }
        } catch (firebaseError: any) {
            console.error('Firebase account creation failed:', firebaseError);
            if (firebaseError.message?.includes('Project Id')) {
                console.warn('Firebase Admin not properly configured. Employee will be created without Firebase account.');
            }
        }

        // Create employee in database
        const employee = await db.employee.create({
            data: {
                name,
                email: personalEmail,      // Personal/contact email
                loginEmail: loginEmail,    // Firebase login email
                adrsId: adrsId || null,    // ADRS employee ID (optional)
                role,
                project: project || 'Unassigned',
                avatarUrl: avatarUrl || `https://picsum.photos/seed/${namePart}/100/100`,
                enrollmentDate: new Date(),
            },
        });

        return NextResponse.json({
            employee,
            firebase: {
                created: firebaseCreated,
                loginEmail: loginEmail,
                personalEmail: personalEmail,
                password: firebaseCreated ? defaultPassword : undefined,
                message: firebaseCreated 
                    ? `Firebase account created. Login with: ${loginEmail}` 
                    : 'Firebase account already exists or creation failed',
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
