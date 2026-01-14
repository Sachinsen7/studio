import { PrismaClient, AttendanceStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAttendance() {
  console.log('🌱 Seeding attendance data...');

  try {
    // Get all employees
    const employees = await prisma.employee.findMany();

    if (employees.length === 0) {
      console.log('⚠️  No employees found. Please seed employees first.');
      return;
    }

    // Generate attendance for the last 30 days
    const today = new Date();
    const attendanceRecords = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }

      for (const employee of employees) {
        // Random attendance status with realistic distribution
        const random = Math.random();
        let status: AttendanceStatus;
        let checkIn: string | null = null;
        let checkOut: string | null = null;

        if (random < 0.75) {
          // 75% present
          status = 'Present';
          checkIn = `0${8 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} AM`;
          checkOut = `0${5 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} PM`;
        } else if (random < 0.85) {
          // 10% late
          status = 'Late';
          checkIn = `${9 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} AM`;
          checkOut = `0${5 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} PM`;
        } else if (random < 0.90) {
          // 5% half day
          status = 'HalfDay';
          checkIn = `0${8 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} AM`;
          checkOut = `01:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} PM`;
        } else if (random < 0.95) {
          // 5% on leave
          status = 'OnLeave';
        } else {
          // 5% absent
          status = 'Absent';
        }

        attendanceRecords.push({
          employeeId: employee.id,
          date,
          status,
          checkIn,
          checkOut,
        });
      }
    }

    // Create attendance records
    for (const record of attendanceRecords) {
      await prisma.attendance.upsert({
        where: {
          employeeId_date: {
            employeeId: record.employeeId,
            date: record.date,
          },
        },
        update: record,
        create: record,
      });
    }

    console.log(`✅ Created ${attendanceRecords.length} attendance records`);

    // Create some leave requests
    const leaveRequests = [
      {
        employeeId: employees[1]?.id,
        startDate: new Date(today.getFullYear(), today.getMonth(), 15),
        endDate: new Date(today.getFullYear(), today.getMonth(), 17),
        leaveType: 'Casual' as const,
        leaveDuration: 'FullDay' as const,
        reason: 'Family vacation',
        status: 'Approved' as const,
      },
      {
        employeeId: employees[2]?.id,
        startDate: new Date(today.getFullYear(), today.getMonth(), 20),
        endDate: new Date(today.getFullYear(), today.getMonth(), 20),
        leaveType: 'Sick' as const,
        leaveDuration: 'FullDay' as const,
        reason: 'Medical appointment',
        status: 'Approved' as const,
      },
      {
        employeeId: employees[3]?.id,
        startDate: new Date(today.getFullYear(), today.getMonth() + 1, 5),
        endDate: new Date(today.getFullYear(), today.getMonth() + 1, 7),
        leaveType: 'Earned' as const,
        leaveDuration: 'FullDay' as const,
        reason: 'Personal work',
        status: 'Pending' as const,
      },
    ];

    for (const leave of leaveRequests) {
      if (leave.employeeId) {
        await prisma.leaveRequest.create({
          data: leave,
        });
      }
    }

    console.log(`✅ Created ${leaveRequests.length} leave requests`);
    console.log('✅ Attendance seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding attendance:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAttendance()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
