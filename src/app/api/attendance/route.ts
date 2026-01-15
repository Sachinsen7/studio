import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AttendanceStatus } from '@prisma/client';

// GET attendance records with optional date filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const employeeId = searchParams.get('employeeId');

    let whereClause: any = {};

    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    if (date) {
      // Specific date
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      
      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (month && year) {
      // Specific month
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      
      whereClause.date = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    const attendance = await db.attendance.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
            project: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

// POST - Create attendance record
export async function POST(request: NextRequest) {
  try {
    // Buffer the request body
    const buffer = await request.arrayBuffer();
    const body = JSON.parse(new TextDecoder().decode(buffer));
    
    const { employeeId, date, status, checkIn, checkOut } = body;

    if (!employeeId || !date || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if attendance already exists for this employee and date
    const existingAttendance = await db.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId,
          date: new Date(date),
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json({ error: 'Attendance already exists for this date' }, { status: 400 });
    }

    const attendance = await db.attendance.create({
      data: {
        employeeId,
        date: new Date(date),
        status: status as AttendanceStatus,
        checkIn,
        checkOut,
      },
      include: {
        employee: true,
      },
    });

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error('Error creating attendance:', error);
    return NextResponse.json({ error: 'Failed to create attendance' }, { status: 500 });
  }
}

// PUT - Update attendance record
export async function PUT(request: NextRequest) {
  try {
    // Buffer the request body
    const buffer = await request.arrayBuffer();
    const body = JSON.parse(new TextDecoder().decode(buffer));
    
    const { id, status, checkIn, checkOut } = body;

    if (!id) {
      return NextResponse.json({ error: 'Attendance ID is required' }, { status: 400 });
    }

    const attendance = await db.attendance.update({
      where: { id },
      data: {
        ...(status && { status: status as AttendanceStatus }),
        ...(checkIn && { checkIn }),
        ...(checkOut && { checkOut }),
      },
      include: {
        employee: true,
      },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Error updating attendance:', error);
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
  }
}
