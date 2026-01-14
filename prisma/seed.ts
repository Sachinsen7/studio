import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const connectionString = 'postgresql://neondb_owner:npg_zZMt8SLfNpq0@ep-old-wind-ahlr4g9a-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding database...');

    // Create Projects
    const projects = await Promise.all([
        prisma.project.upsert({
            where: { name: 'Phoenix' },
            update: {},
            create: { name: 'Phoenix', status: 'OnTrack', progress: 75 },
        }),
        prisma.project.upsert({
            where: { name: 'Odyssey' },
            update: {},
            create: { name: 'Odyssey', status: 'AtRisk', progress: 40 },
        }),
        prisma.project.upsert({
            where: { name: 'Vanguard' },
            update: {},
            create: { name: 'Vanguard', status: 'OnTrack', progress: 60 },
        }),
        prisma.project.upsert({
            where: { name: 'Mirage' },
            update: {},
            create: { name: 'Mirage', status: 'Completed', progress: 100 },
        }),
    ]);

    console.log('Created projects:', projects.map(p => p.name));

    // Create Employees
    const employees = [
        { name: 'Admin User', email: 'admin@adrs.com', role: 'Admin' as const, project: 'All' },
        { name: 'Sachin', email: 'sachin@adrs.com', role: 'Developer' as const, project: 'Phoenix' },
        { name: 'Srajal', email: 'srajal@adrs.com', role: 'Designer' as const, project: 'Odyssey' },
        { name: 'Sakshi', email: 'sakshi@adrs.com', role: 'Manager' as const, project: 'Vanguard' },
        { name: 'Sapeksh', email: 'sapeksh@adrs.com', role: 'QA' as const, project: 'Phoenix' },
        { name: 'Sparsh', email: 'sparsh@adrs.com', role: 'Developer' as const, project: 'Odyssey' },
        { name: 'Danish', email: 'danish@adrs.com', role: 'Developer' as const, project: 'Vanguard' },
        { name: 'Sneha', email: 'sneha@adrs.com', role: 'Designer' as const, project: 'Phoenix' },
        { name: 'Ishant', email: 'ishant@adrs.com', role: 'QA' as const, project: 'Odyssey' },
    ];

    for (const emp of employees) {
        await prisma.employee.upsert({
            where: { email: emp.email },
            update: {},
            create: {
                name: emp.name,
                email: emp.email,
                role: emp.role,
                project: emp.project,
                avatarUrl: `https://picsum.photos/seed/${emp.name.toLowerCase().replace(/\s/g, '')}/100/100`,
            },
        });
    }

    console.log('Created employees:', employees.map(e => e.name));
    console.log('Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
