import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET single employee
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const employee = await db.employee.findUnique({ where: { id } });

        if (!employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        return NextResponse.json(employee);
    } catch (error) {
        console.error('Error fetching employee:', error);
        return NextResponse.json({ error: 'Failed to fetch employee' }, { status: 500 });
    }
}

// PUT - Update employee
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        // Buffer the request body
        const buffer = await request.arrayBuffer();
        const body = JSON.parse(new TextDecoder().decode(buffer));
        
        const { name, email, phone, loginEmail, adrsId, role, project, projects, avatarUrl, isActive } = body;

        // Build update data object with only provided fields
        const updateData: Record<string, any> = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (loginEmail !== undefined) updateData.loginEmail = loginEmail || null;
        if (adrsId !== undefined) updateData.adrsId = adrsId || null;
        if (role !== undefined) updateData.role = role;
        if (project !== undefined) updateData.project = project;
        if (projects !== undefined) updateData.projects = projects;
        if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
        if (isActive !== undefined) updateData.isActive = isActive;

        const employee = await db.employee.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(employee);
    } catch (error: any) {
        console.error('Error updating employee:', error);
        
        if (error.code === 'P2002') {
            return NextResponse.json({ 
                error: 'Email or ADRS ID already in use by another employee',
                code: 'DUPLICATE_EMAIL'
            }, { status: 409 });
        }
        
        return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
    }
}

// DELETE - Remove employee
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await db.employee.delete({ where: { id } });
        return NextResponse.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Error deleting employee:', error);
        return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
    }
}
