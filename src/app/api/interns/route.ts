import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { UserRole } from '@prisma/client';

// GET /api/interns - Get all interns with optional filtering
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const mentorId = searchParams.get('mentorId');
        const project = searchParams.get('project');
        const search = searchParams.get('search');

        const where: any = {};

        if (status) {
            where.status = status;
        }

        if (mentorId) {
            where.mentorId = mentorId;
        }

        if (project && project !== 'all') {
            where.project = project;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { university: { contains: search, mode: 'insensitive' } },
            ];
        }

        const interns = await prisma.intern.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                evaluations: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
                stipendPayments: {
                    orderBy: { paymentDate: 'desc' },
                },
            },
        });

        // Update status based on dates and fetch mentor details
        const now = new Date();
        const updatedInterns = await Promise.all(
            interns.map(async (intern) => {
                let newStatus = intern.status;

                if (intern.status !== 'Terminated') {
                    if (now < new Date(intern.startDate)) {
                        newStatus = 'Upcoming';
                    } else if (intern.endDate && now > new Date(intern.endDate)) {
                        newStatus = 'Completed';
                    } else {
                        newStatus = 'Active';
                    }

                    if (newStatus !== intern.status) {
                        await prisma.intern.update({
                            where: { id: intern.id },
                            data: { status: newStatus },
                        });
                    }
                }

                // Get mentor details if assigned
                let mentor = null;
                if (intern.mentorId) {
                    mentor = await prisma.employee.findUnique({
                        where: { id: intern.mentorId },
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    });
                }

                return { ...intern, status: newStatus, mentor };
            })
        );

        return NextResponse.json(updatedInterns);
    } catch (error) {
        console.error('Error fetching interns:', error);
        return NextResponse.json(
            { error: 'Failed to fetch interns' },
            { status: 500 }
        );
    }
}

// POST /api/interns - Create a new intern
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            name,
            email,
            phone,
            avatarUrl,
            university,
            degree,
            startDate,
            endDate,
            stipendAmount,
            mentorId,
            project,
        } = body;

        // Validate required fields
        if (!name || !email || !startDate) {
            return NextResponse.json(
                { error: 'Name, email, and start date are required' },
                { status: 400 }
            );
        }

        // Validate date range if endDate is provided
        if (endDate && endDate.trim() !== '' && new Date(startDate) >= new Date(endDate)) {
            return NextResponse.json(
                { error: 'End date must be after start date' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingIntern = await prisma.intern.findUnique({
            where: { email },
        });

        if (existingIntern) {
            return NextResponse.json(
                { error: 'An intern with this email already exists', code: 'DUPLICATE_EMAIL' },
                { status: 409 }
            );
        }

        // Determine initial status
        const now = new Date();
        const start = new Date(startDate);
        let status: 'Upcoming' | 'Active' | 'Completed' = 'Upcoming';

        const hasValidEndDate = endDate && endDate.trim() !== '';

        if (hasValidEndDate) {
            const end = new Date(endDate);
            if (now >= start && now <= end) {
                status = 'Active';
            } else if (now > end) {
                status = 'Completed';
            } else if (now < start) {
                status = 'Upcoming';
            }
        } else {
            // If no end date, determine status based on start date only
            if (now >= start) {
                status = 'Active';
            }
        }

        // Create intern
        const intern = await prisma.intern.create({
            data: {
                name,
                email,
                phone,
                avatarUrl,
                university,
                degree,
                startDate: new Date(startDate),
                endDate: hasValidEndDate ? new Date(endDate) : null,
                status,
                stipendAmount: stipendAmount ? parseFloat(stipendAmount) : null,
                mentorId,
                project: project || 'Unassigned',
            },
        });

        // Generate default password: FirstName@123
        const firstName = name.split(' ')[0];
        const defaultPassword = `${firstName}@123`;
        const hashedPassword = await hashPassword(defaultPassword);

        // Create User account for authentication
        await prisma.user.create({
            data: {
                email: email,
                name: name,
                passwordHash: hashedPassword,
                role: UserRole.intern,
                internId: intern.id,
            },
        });

        return NextResponse.json({
            intern,
            credentials: {
                email: email,
                password: defaultPassword,
                message: `User account created. Login with email: ${email} and password: ${defaultPassword}`,
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating intern:', error);
        return NextResponse.json(
            { error: 'Failed to create intern' },
            { status: 500 }
        );
    }
}
