const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function seedAdminUser() {
    const prisma = new PrismaClient();
    
    try {
        console.log('🌱 Seeding admin user...');

        // Hash the admin password
        const hashedPassword = await bcrypt.hash('Admin@123', 10);

        // Create admin user
        const adminUser = await prisma.user.upsert({
            where: { email: 'admin@adrs.com' },
            update: {
                passwordHash: hashedPassword,
                role: 'admin',
            },
            create: {
                email: 'admin@adrs.com',
                name: 'Admin User',
                passwordHash: hashedPassword,
                role: 'admin',
            },
        });

        console.log('✅ Admin user created/updated:', adminUser.email);

        // Create a sample employee for testing
        const employee = await prisma.employee.upsert({
            where: { email: 'employee@adrs.com' },
            update: {},
            create: {
                name: 'Test Employee',
                email: 'employee@adrs.com',
                role: 'Developer',
                project: 'Unassigned',
                isActive: true,
            },
        });

        console.log('✅ Test employee created:', employee.email);

        // Create user account for the employee
        const employeeHashedPassword = await bcrypt.hash('Employee@123', 10);
        const employeeUser = await prisma.user.upsert({
            where: { email: 'employee@adrs.com' },
            update: {
                passwordHash: employeeHashedPassword,
                role: 'employee',
                employeeId: employee.id,
            },
            create: {
                email: 'employee@adrs.com',
                name: 'Test Employee',
                passwordHash: employeeHashedPassword,
                role: 'employee',
                employeeId: employee.id,
            },
        });

        console.log('✅ Employee user account created:', employeeUser.email);

        // Create a sample project
        const project = await prisma.project.upsert({
            where: { name: 'Sample Project' },
            update: {},
            create: {
                name: 'Sample Project',
                status: 'OnTrack',
                progress: 25,
                projectType: 'Project',
                description: 'A sample project for testing',
            },
        });

        console.log('✅ Sample project created:', project.name);

        console.log('\n🎉 Seeding completed successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('Admin: admin@adrs.com / Admin@123');
        console.log('Employee: employee@adrs.com / Employee@123');

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedAdminUser()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });