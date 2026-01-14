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
        const body = await request.json();
        const { name, email, role, project, avatarUrl } = body;

        if (!name || !email || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate Firebase email and default password
        const firebaseEmail = email.includes('@') ? email : `${email}@adrs.com`;
        const defaultPassword = 'password'; // Default password for all new employees

        // Create Firebase account automatically
        let firebaseResult;
        try {
            firebaseResult = await createFirebaseUser(firebaseEmail, defaultPassword, name);
            
            if (!firebaseResult.success) {
                // If email already exists in Firebase, continue with employee creation
                console.warn(`Firebase account already exists for ${firebaseEmail}`);
            }
        } catch (firebaseError) {
            console.error('Firebase account creation failed:', firebaseError);
            // Continue with employee creation even if Firebase fails
        }

        // Create employee in database
        const employee = await db.employee.create({
            data: {
                name,
                email: firebaseEmail,
                role,
                project: project || 'Unassigned',
                avatarUrl: avatarUrl || `https://picsum.photos/seed/${name.toLowerCase().replace(/\s/g, '')}/100/100`,
                enrollmentDate: new Date(),
            },
        });

        return NextResponse.json({
            employee,
            firebase: {
                created: firebaseResult?.success || false,
                email: firebaseEmail,
                password: defaultPassword,
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating employee:', error);
        return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
    }
}
