import { NextRequest, NextResponse } from 'next/server';
import { db, withRetry } from '@/lib/db';
import bcrypt from 'bcryptjs';

// POST /api/setup/admin - Create initial admin user
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Check if admin already exists (with retry)
        const existingAdmin = await withRetry(async () => {
            return await db.user.findFirst({
                where: { role: 'admin' }
            });
        });

        if (existingAdmin) {
            return NextResponse.json(
                { error: 'Admin user already exists' },
                { status: 400 }
            );
        }

        // Check if email is already taken (with retry)
        const existingUser = await withRetry(async () => {
            return await db.user.findUnique({
                where: { email }
            });
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already in use' },
                { status: 400 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create admin user (with retry)
        const admin = await withRetry(async () => {
            return await db.user.create({
                data: {
                    name,
                    email,
                    passwordHash,
                    role: 'admin'
                }
            });
        });

        return NextResponse.json({
            message: 'Admin user created successfully',
            user: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating admin user:', error);
        
        // Provide more specific error messages
        if (error.message?.includes('timeout')) {
            return NextResponse.json(
                { error: 'Database connection timeout. Please try again.' },
                { status: 503 }
            );
        }
        
        if (error.message?.includes('Connection terminated')) {
            return NextResponse.json(
                { error: 'Database connection lost. Please try again.' },
                { status: 503 }
            );
        }
        
        return NextResponse.json(
            { error: 'Failed to create admin user. Please try again.' },
            { status: 500 }
        );
    }
}