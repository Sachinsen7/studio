import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE - Delete a specific document
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; docId: string }> }
) {
    try {
        const { id, docId } = await params;

        // Verify project exists
        const project = await db.project.findUnique({
            where: { id },
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Delete the document
        await db.projectDocument.delete({
            where: { 
                id: docId,
                projectId: id, // Ensure document belongs to this project
            },
        });

        return NextResponse.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }
}