import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Get all documents for a project by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const project = await db.project.findUnique({
            where: { id },
            include: {
                documents: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json(project.documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }
}

// POST - Add a new document to a project by ID
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, type, content, fileUrl, fileName, fileSize, mimeType, uploadedBy } = body;

        const project = await db.project.findUnique({
            where: { id },
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const document = await db.projectDocument.create({
            data: {
                projectId: project.id,
                title,
                type: type || 'General',
                content,
                fileUrl,
                fileName,
                fileSize,
                mimeType,
                uploadedBy,
            },
        });

        return NextResponse.json(document, { status: 201 });
    } catch (error) {
        console.error('Error creating document:', error);
        return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
    }
}