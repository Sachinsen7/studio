import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE - Delete a specific daily log
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; logId: string }> }
) {
    try {
        const { id, logId } = await params;

        // Verify project exists
        const project = await db.project.findUnique({
            where: { id },
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Delete the daily log
        await db.projectDailyLog.delete({
            where: { 
                id: logId,
                projectId: id, // Ensure log belongs to this project
            },
        });

        return NextResponse.json({ message: 'Daily log deleted successfully' });
    } catch (error) {
        console.error('Error deleting daily log:', error);
        return NextResponse.json({ error: 'Failed to delete daily log' }, { status: 500 });
    }
}