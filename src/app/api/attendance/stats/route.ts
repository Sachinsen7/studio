import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET attendance statistics for a specific date
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date') || new Date().toISOString();

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Get all attendance records for the date
    const attendanceRecords = await db.attendance.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Calculate stats
    const stats = {
      present: attendanceRecords.filter(a => a.status === 'Present').length,
      late: attendanceRecords.filter(a => a.status === 'Late').length,
      absent: attendanceRecords.filter(a => a.status === 'Absent').length,
      onLeave: attendanceRecords.filter(a => a.status === 'OnLeave').length,
      halfDay: attendanceRecords.filter(a => a.status === 'HalfDay').length,
      total: attendanceRecords.length,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance stats' }, { status: 500 });
  }
}
