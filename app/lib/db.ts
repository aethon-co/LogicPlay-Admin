import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error('Missing DATABASE_URL environment variable');
}


const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

export default pool;
