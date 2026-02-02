import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!connectionString) {
    throw new Error('Missing DATABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable');
}

// Create a connection pool
const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false // Required for Supabase/AWS RDS usually
    }
});

export default pool;
