import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Add loginEmail column to employees table if it doesn't exist
export async function POST() {
    try {
        // Try to add the column using raw SQL
        await db.$executeRawUnsafe(`
            ALTER TABLE employees 
            ADD COLUMN IF NOT EXISTS "loginEmail" VARCHAR(255) UNIQUE
        `);

        return NextResponse.json({ 
            success: true, 
            message: 'loginEmail column added successfully' 
        });
    } catch (error: any) {
        console.error('Error adding column:', error);
        
        // Column might already exist
        if (error.message?.includes('already exists')) {
            return NextResponse.json({ 
                success: true, 
                message: 'loginEmail column already exists' 
            });
        }
        
        return NextResponse.json({ 
            error: 'Failed to add column',
            details: error.message 
        }, { status: 500 });
    }
}
