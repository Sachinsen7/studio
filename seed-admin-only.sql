-- Simple SQL script to create admin user
-- Run this in your Neon database console

-- Insert admin user (password is Admin@123)
INSERT INTO "users" ("id", "email", "passwordHash", "name", "role", "createdAt", "updatedAt") 
VALUES (
    'admin-' || generate_random_uuid(), 
    'admin@adrs.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'Admin User', 
    'admin', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO UPDATE SET
    "passwordHash" = EXCLUDED."passwordHash",
    "role" = EXCLUDED."role",
    "updatedAt" = CURRENT_TIMESTAMP;

-- Insert sample employee
INSERT INTO "employees" ("id", "name", "email", "role", "project", "isActive", "createdAt", "updatedAt") 
VALUES (
    'emp-' || generate_random_uuid(), 
    'Test Employee', 
    'employee@adrs.com', 
    'Developer', 
    'Unassigned', 
    true, 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO UPDATE SET
    "name" = EXCLUDED."name",
    "role" = EXCLUDED."role",
    "updatedAt" = CURRENT_TIMESTAMP;

-- Insert employee user account (password is Employee@123)
INSERT INTO "users" ("id", "email", "passwordHash", "name", "role", "employeeId", "createdAt", "updatedAt") 
VALUES (
    'emp-user-' || generate_random_uuid(), 
    'employee@adrs.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    'Test Employee', 
    'employee', 
    (SELECT id FROM employees WHERE email = 'employee@adrs.com' LIMIT 1), 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
) ON CONFLICT (email) DO UPDATE SET
    "passwordHash" = EXCLUDED."passwordHash",
    "role" = EXCLUDED."role",
    "employeeId" = EXCLUDED."employeeId",
    "updatedAt" = CURRENT_TIMESTAMP;

SELECT 'Admin user seeded successfully! Login with admin@adrs.com / Admin@123' as message;