import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET attendance records
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employeeId');
        const date = searchParams.get('date');

        const where: Record<string, unknown> = {};
        if (employeeId) where.employeeId = employeeId;
        if (date) where.date = new Date(date);

        const attendance = await db.attendance.findMany({
            where,
            include: { employee: true },
            orderBy: { date: 'desc' },
        });

        return NextResponse.json(attendance);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
    }
}

// POST - Mark attendance
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { employeeId, date, status, checkIn, checkOut } = body;

        if (!employeeId || !status) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const attendanceDate = date ? new Date(date) : new Date();
        attendanceDate.setHours(0, 0, 0, 0);

        // Check if attendance already exists for this employee on this date
        const existing = await db.attendance.findFirst({
            where: {
                employeeId,
                date: attendanceDate,
            },
        });

        if (existing) {
            // Update existing record
            const updated = await db.attendance.update({
                where: { id: existing.id },
                data: { status, checkIn, checkOut },
            });
            return NextResponse.json(updated);
        }

        // Create new attendance record
        const attendance = await db.attendance.create({
            data: {
                employeeId,
                date: attendanceDate,
                status,
                checkIn,
                checkOut,
            },
        });

        return NextResponse.json(attendance, { status: 201 });
    } catch (error) {
        console.error('Error marking attendance:', error);
        return NextResponse.json({ error: 'Failed to mark attendance' }, { status: 500 });
    }
}
