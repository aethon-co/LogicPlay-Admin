import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!connectionString) {
    throw new Error('Missing DATABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable');
}


const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false 
    }
});

export default pool;
