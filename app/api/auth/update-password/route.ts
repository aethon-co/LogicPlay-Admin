import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import bcrypt from 'bcryptjs';
import { getSession } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { password } = await request.json();

        if (!password || password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query('UPDATE admins SET password_hash = $1 WHERE id = $2', [hashedPassword, session.id]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
