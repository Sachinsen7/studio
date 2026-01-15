import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET leave requests
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const employeeId = searchParams.get('employeeId');
        const status = searchParams.get('status');

        const where: Record<string, unknown> = {};
        if (employeeId) where.employeeId = employeeId;
        if (status) where.status = status;

        const leaveRequests = await db.leaveRequest.findMany({
            where,
            include: { employee: true },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(leaveRequests);
    } catch (error) {
        console.error('Error fetching leave requests:', error);
        return NextResponse.json({ error: 'Failed to fetch leave requests' }, { status: 500 });
    }
}

// POST - Create leave request
export async function POST(request: NextRequest) {
    try {
        // Buffer the request body
        const buffer = await request.arrayBuffer();
        const body = JSON.parse(new TextDecoder().decode(buffer));
        
        const { employeeId, startDate, endDate, leaveType, leaveDuration, reason } = body;

        if (!employeeId || !startDate || !endDate) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const leaveRequest = await db.leaveRequest.create({
            data: {
                employeeId,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                leaveType: leaveType || 'CasualLeave',
                leaveDuration: leaveDuration || 'FullDay',
                reason,
                status: 'Pending',
            },
            include: { employee: true },
        });

        return NextResponse.json(leaveRequest, { status: 201 });
    } catch (error) {
        console.error('Error creating leave request:', error);
        return NextResponse.json({ error: 'Failed to create leave request' }, { status: 500 });
    }
}
