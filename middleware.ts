import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './app/lib/auth';

export async function middleware(request: NextRequest) {
    const session = await getSession();

    // If trying to access dashboard but not logged in, redirect to login
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!session) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // If trying to access login but already logged in, redirect to dashboard
    if (request.nextUrl.pathname.startsWith('/login')) {
        if (session) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login'],
};
