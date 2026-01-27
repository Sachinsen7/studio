import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        console.log('🌱 Seeding admin user...');

        // Hash the admin password
        const hashedPassword = await hashPassword('Admin@123');

        // Create admin user
        const adminUser = await db.user.upsert({
            where: { email: 'admin@adrs.com' },
            update: {
                passwordHash: hashedPassword,
                role: 'admin',
            },
            create: {
                email: 'admin@adrs.com',
                name: 'Admin User',
                passwordHash: hashedPassword,
                role: 'admin',
            },
        });

        console.log('✅ Admin user created/updated:', adminUser.email);

        // Create a sample employee for testing
        const employee = await db.employee.upsert({
            where: { email: 'employee@adrs.com' },
            update: {},
            create: {
                name: 'Test Employee',
                email: 'employee@adrs.com',
                role: 'Developer',
                project: 'Unassigned',
                isActive: true,
            },
        });

        console.log('✅ Test employee created:', employee.email);

        // Create user account for the employee
        const employeeHashedPassword = await hashPassword('Employee@123');
        const employeeUser = await db.user.upsert({
            where: { email: 'employee@adrs.com' },
            update: {
                passwordHash: employeeHashedPassword,
                role: 'employee',
                employeeId: employee.id,
            },
            create: {
                email: 'employee@adrs.com',
                name: 'Test Employee',
                passwordHash: employeeHashedPassword,
                role: 'employee',
                employeeId: employee.id,
            },
        });

        console.log('✅ Employee user account created:', employeeUser.email);

        // Create a sample project with the old enum value that exists in database
        const project = await db.project.upsert({
            where: { name: 'Sample Project' },
            update: {},
            create: {
                name: 'Sample Project',
                status: 'OnTrack',
                progress: 25,
                projectType: 'Company', // Use the old enum value that exists in database
                description: 'A sample project for testing',
            },
        });

        console.log('✅ Sample project created:', project.name);

        return NextResponse.json({
            success: true,
            message: 'Admin user and sample data seeded successfully!',
            credentials: {
                admin: { email: 'admin@adrs.com', password: 'Admin@123' },
                employee: { email: 'employee@adrs.com', password: 'Employee@123' }
            }
        });

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        return NextResponse.json(
            { error: 'Failed to seed admin user', details: error },
            { status: 500 }
        );
    }
}