import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET dashboard statistics
export async function GET() {
    try {
        // Get counts
        const [employeeCount, projectCount, taskStats] = await Promise.all([
            db.employee.count(),
            db.project.count(),
            db.task.groupBy({
                by: ['status'],
                _count: true,
            }),
        ]);

        const completedTasks = taskStats.find(s => s.status === 'Done')?._count || 0;
        const inProgressTasks = taskStats.find(s => s.status === 'InProgress')?._count || 0;
        const todoTasks = taskStats.find(s => s.status === 'ToDo')?._count || 0;

        // Get project status breakdown
        const projectsByStatus = await db.project.groupBy({
            by: ['status'],
            _count: true,
        });

        const onTrackProjects = projectsByStatus.find(p => p.status === 'OnTrack')?._count || 0;
        const atRiskProjects = projectsByStatus.find(p => p.status === 'AtRisk')?._count || 0;
        const completedProjects = projectsByStatus.find(p => p.status === 'Completed')?._count || 0;

        // Get employee enrollment stats
        const employees = await db.employee.findMany({
            include: {
                tasks: {
                    select: {
                        projectId: true,
                    },
                },
            },
        });

        const employeeProjectCounts = employees.map(emp => {
            const uniqueProjects = new Set(emp.tasks.map(t => t.projectId));
            return {
                ...emp,
                projectCount: uniqueProjects.size,
            };
        });

        const notEnrolled = employeeProjectCounts.filter(e => e.projectCount === 0).length;
        const singleProject = employeeProjectCounts.filter(e => e.projectCount === 1).length;
        const multipleProjects = employeeProjectCounts.filter(e => e.projectCount > 1).length;

        // Get top contributors
        const topContributors = employeeProjectCounts
            .sort((a, b) => b.projectCount - a.projectCount)
            .slice(0, 5)
            .map(emp => ({
                id: emp.id,
                name: emp.name,
                email: emp.email,
                avatarUrl: emp.avatarUrl,
                role: emp.role,
                projectCount: emp.projectCount,
            }));

        return NextResponse.json({
            totalEmployees: employeeCount,
            totalProjects: projectCount,
            completedTasks,
            inProgressTasks,
            todoTasks,
            onTrackProjects,
            atRiskProjects,
            completedProjects,
            notEnrolled,
            singleProject,
            multipleProjects,
            topContributors,
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
    }
}
