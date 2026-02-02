import { NextRequest, NextResponse } from 'next/server';
import { logout } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
    await logout();
    return NextResponse.json({ success: true });
}
