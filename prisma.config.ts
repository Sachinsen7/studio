import path from 'node:path';
import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    earlyAccess: true,
    schema: path.join(__dirname, 'prisma', 'schema.prisma'),
    datasource: {
        url: process.env.DATABASE_URL!,
    },
    migrate: {
        adapter: async () => {
            const pg = await import('pg');
            const { PrismaPg } = await import('@prisma/adapter-pg');

            const connectionString = process.env.DATABASE_URL!;
            const pool = new pg.default.Pool({ connectionString });
            return new PrismaPg(pool);
        },
    },
});
