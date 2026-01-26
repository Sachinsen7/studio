import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';

// GET /api/interns/[id]/evaluations - Get all evaluations for an intern
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const evaluations = await prisma.internEvaluation.findMany({
            where: { internId: id },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(evaluations);
    } catch (error) {
        console.error('Error fetching evaluations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch evaluations' },
            { status: 500 }
        );
    }
}

// POST /api/interns/[id]/evaluations - Create a new evaluation
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { mentorId, mentorName, rating, feedback, skills } = body;

        // Validate required fields
        if (!mentorId || !mentorName || !rating) {
            return NextResponse.json(
                { error: 'Mentor ID, mentor name, and rating are required' },
                { status: 400 }
            );
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        // Verify intern exists
        const intern = await prisma.intern.findUnique({
            where: { id },
        });

        if (!intern) {
            return NextResponse.json(
                { error: 'Intern not found' },
                { status: 404 }
            );
        }

        // Create evaluation
        const evaluation = await prisma.internEvaluation.create({
            data: {
                internId: id,
                mentorId,
                mentorName,
                rating,
                feedback,
                skills: skills ? JSON.stringify(skills) : null,
            },
        });

        return NextResponse.json(evaluation, { status: 201 });
    } catch (error) {
        console.error('Error creating evaluation:', error);
        return NextResponse.json(
            { error: 'Failed to create evaluation' },
            { status: 500 }
        );
    }
}
