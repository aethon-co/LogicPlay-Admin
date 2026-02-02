import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();
        const hashedPassword = await bcrypt.hash(password, 10);

        const { rows } = await pool.query(
            'INSERT INTO admins (email, password_hash) VALUES ($1, $2) RETURNING id, email',
            [email, hashedPassword]
        );

        return NextResponse.json({ success: true, admin: rows[0] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
