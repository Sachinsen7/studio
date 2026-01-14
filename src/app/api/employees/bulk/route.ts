import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Bulk create employees and Firebase accounts
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { employees, createFirebaseAccounts = true, useAdrsEmail = false, defaultPassword = 'password' } = body;

        if (!employees || !Array.isArray(employees)) {
            return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
        }

        const results = {
            database: {
                created: [] as any[],
                existing: [] as any[],
                failed: [] as any[],
            },
            firebase: {
                created: [] as any[],
                existing: [] as any[],
                failed: [] as any[],
            }
        };

        // Create employees in database and Firebase
        for (const emp of employees) {
            try {
                // Check if employee already exists in database
                const existing = await db.employee.findUnique({
                    where: { email: emp.email }
                });

                let dbEmployee;
                if (existing) {
                    console.log(`Employee ${emp.email} already exists in database, skipping...`);
                    results.database.existing.push(existing);
                    dbEmployee = existing;
                } else {
                    // Create new employee in database
                    dbEmployee = await db.employee.create({
                        data: {
                            name: emp.name,
                            email: emp.email,
                            role: emp.role || 'Developer',
                            project: emp.project || 'Unassigned',
                            avatarUrl: emp.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.name}`,
                        }
                    });
                    results.database.created.push(dbEmployee);
                }

                // Create Firebase account if requested
                if (createFirebaseAccounts) {
                    try {
                        // Determine email for Firebase
                        let firebaseEmail = emp.email;
                        if (useAdrsEmail) {
                            const firstName = emp.name.split(' ')[0].toLowerCase();
                            firebaseEmail = `${firstName}@adrs.com`;
                        }

                        // Call client-side Firebase creation endpoint
                        // Note: This returns a registration payload that the client will use
                        const firebaseData = {
                            email: firebaseEmail,
                            password: defaultPassword,
                            displayName: emp.name,
                            role: emp.role || 'Developer',
                        };

                        results.firebase.created.push({
                            name: emp.name,
                            email: firebaseEmail,
                            originalEmail: emp.email,
                            password: defaultPassword,
                            status: 'ready_for_creation',
                        });
                    } catch (firebaseError: any) {
                        results.firebase.failed.push({
                            name: emp.name,
                            email: emp.email,
                            reason: firebaseError.message,
                        });
                    }
                }
            } catch (error: any) {
                results.database.failed.push({
                    name: emp.name,
                    email: emp.email,
                    reason: error.message,
                });
            }
        }

        return NextResponse.json({
            message: 'Employee creation completed',
            results,
            firebaseAccountsCreated: createFirebaseAccounts,
            defaultPassword: createFirebaseAccounts ? defaultPassword : null,
            instructions: createFirebaseAccounts 
                ? 'Firebase accounts need to be created client-side. Use the returned data to create accounts.'
                : 'Database records created. Firebase accounts not requested.',
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating employees:', error);
        return NextResponse.json({ error: 'Failed to create employees' }, { status: 500 });
    }
}
