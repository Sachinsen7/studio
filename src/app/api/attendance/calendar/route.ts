import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET calendar data with leave days and attendance summary
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!month || !year) {
      return NextResponse.json({ error: 'Month and year are required' }, { status: 400 });
    }

    const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

    // Get all attendance records for the month
    const attendanceRecords = await db.attendance.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        employee: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get approved leave requests for the month
    const leaveRequests = await db.leaveRequest.findMany({
      where: {
        status: 'Approved',
        OR: [
          {
            startDate: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          {
            endDate: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        ],
      },
      include: {
        employee: {
          select: {
            name: true,
          },
        },
      },
    });

    // Group attendance by date
    const attendanceByDate: Record<string, any> = {};
    
    attendanceRecords.forEach(record => {
      const dateKey = record.date.toISOString().split('T')[0];
      if (!attendanceByDate[dateKey]) {
        attendanceByDate[dateKey] = {
          date: dateKey,
          present: 0,
          late: 0,
          absent: 0,
          onLeave: 0,
          halfDay: 0,
        };
      }
      
      if (record.status === 'Present') attendanceByDate[dateKey].present++;
      else if (record.status === 'Late') attendanceByDate[dateKey].late++;
      else if (record.status === 'Absent') attendanceByDate[dateKey].absent++;
      else if (record.status === 'OnLeave') attendanceByDate[dateKey].onLeave++;
      else if (record.status === 'HalfDay') attendanceByDate[dateKey].halfDay++;
    });

    // Process leave requests to get all dates in range
    const leaveDays: string[] = [];
    leaveRequests.forEach(leave => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toISOString().split('T')[0];
        if (!leaveDays.includes(dateKey)) {
          leaveDays.push(dateKey);
        }
      }
    });

    return NextResponse.json({
      attendanceByDate,
      leaveDays,
      summary: Object.values(attendanceByDate),
    });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 });
  }
}
