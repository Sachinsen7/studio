import { NextRequest, NextResponse } from 'next/server';
import { db, withRetry } from '@/lib/db';
import { AttendanceStatus } from '@prisma/client';

// GET intern attendance records
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const searchParams = request.nextUrl.searchParams;
        const date = searchParams.get('date');
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        // First verify the intern exists
        const intern = await withRetry(async () => {
            return await db.intern.findUnique({
                where: { id },
            });
        });

        if (!intern) {
            return NextResponse.json({ error: 'Intern not found' }, { status: 404 });
        }

        // Get the employee record linked to this intern (for attendance tracking)
        const employee = await withRetry(async () => {
            return await db.employee.findFirst({
                where: { email: intern.email },
            });
        });

        if (!employee) {
            return NextResponse.json({ 
                error: 'No employee record found for this intern',
                message: 'Attendance tracking requires an employee record'
            }, { status: 404 });
        }

        let whereClause: any = {
            employeeId: employee.id,
        };

        if (date) {
            const targetDate = new Date(date);
            const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

            whereClause.date = {
                gte: startOfDay,
                lte: endOfDay,
            };
        } else if (month && year) {
            const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
            const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

            whereClause.date = {
                gte: startOfMonth,
                lte: endOfMonth,
            };
        }

        const attendance = await withRetry(async () => {
            return await db.attendance.findMany({
                where: whereClause,
                orderBy: { date: 'desc' },
            });
        });

        return NextResponse.json({
            attendance,
            employeeId: employee.id,
        });
    } catch (error) {
        console.error('Error fetching intern attendance:', error);
        return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
    }
}

// POST - Punch In (create attendance record)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Verify intern exists
        const intern = await withRetry(async () => {
            return await db.intern.findUnique({
                where: { id },
            });
        });

        if (!intern) {
            return NextResponse.json({ error: 'Intern not found' }, { status: 404 });
        }

        // Get employee record
        const employee = await withRetry(async () => {
            return await db.employee.findFirst({
                where: { email: intern.email },
            });
        });

        if (!employee) {
            return NextResponse.json({ 
                error: 'No employee record found for this intern' 
            }, { status: 404 });
        }

        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if already punched in today
        const existingAttendance = await withRetry(async () => {
            return await db.attendance.findFirst({
                where: {
                    employeeId: employee.id,
                    date: {
                        gte: today,
                        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                    },
                },
            });
        });

        if (existingAttendance) {
            return NextResponse.json({ 
                error: 'Already punched in today',
                attendance: existingAttendance
            }, { status: 400 });
        }

        // Create attendance record with punch in time
        const now = new Date();
        const checkInTime = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        const attendance = await withRetry(async () => {
            return await db.attendance.create({
                data: {
                    employeeId: employee.id,
                    date: today,
                    status: AttendanceStatus.Present,
                    checkIn: checkInTime,
                },
            });
        });

        return NextResponse.json({
            message: 'Punched in successfully',
            attendance,
        }, { status: 201 });
    } catch (error) {
        console.error('Error punching in:', error);
        return NextResponse.json({ error: 'Failed to punch in' }, { status: 500 });
    }
}

// PATCH - Punch Out (update attendance record)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Verify intern exists
        const intern = await withRetry(async () => {
            return await db.intern.findUnique({
                where: { id },
            });
        });

        if (!intern) {
            return NextResponse.json({ error: 'Intern not found' }, { status: 404 });
        }

        // Get employee record
        const employee = await withRetry(async () => {
            return await db.employee.findFirst({
                where: { email: intern.email },
            });
        });

        if (!employee) {
            return NextResponse.json({ 
                error: 'No employee record found for this intern' 
            }, { status: 404 });
        }

        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find today's attendance record
        const existingAttendance = await withRetry(async () => {
            return await db.attendance.findFirst({
                where: {
                    employeeId: employee.id,
                    date: {
                        gte: today,
                        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                    },
                },
            });
        });

        if (!existingAttendance) {
            return NextResponse.json({ 
                error: 'No punch in record found for today' 
            }, { status: 400 });
        }

        if (existingAttendance.checkOut) {
            return NextResponse.json({ 
                error: 'Already punched out today',
                attendance: existingAttendance
            }, { status: 400 });
        }

        // Update with punch out time
        const now = new Date();
        const checkOutTime = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        const attendance = await withRetry(async () => {
            return await db.attendance.update({
                where: { id: existingAttendance.id },
                data: {
                    checkOut: checkOutTime,
                },
            });
        });

        return NextResponse.json({
            message: 'Punched out successfully',
            attendance,
        });
    } catch (error) {
        console.error('Error punching out:', error);
        return NextResponse.json({ error: 'Failed to punch out' }, { status: 500 });
    }
}
