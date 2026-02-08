import { NextRequest, NextResponse } from 'next/server';

function getBackendConfig() {
  const backendBaseUrl = process.env.BACKEND_BASE_URL || 'http://localhost:3000';
  const adminKey = process.env.BACKEND_ADMIN_API_KEY || process.env.ADMIN_API_KEY || '';
  return { backendBaseUrl, adminKey };
}

export async function POST(request: NextRequest) {
  try {
    const { csv } = await request.json();
    if (!csv || typeof csv !== 'string') {
      return NextResponse.json({ error: 'CSV content is required' }, { status: 400 });
    }

    const { backendBaseUrl, adminKey } = getBackendConfig();
    if (!adminKey) {
      return NextResponse.json({ error: 'BACKEND_ADMIN_API_KEY not configured' }, { status: 500 });
    }

    const endpoint = `${backendBaseUrl.replace(/\/+$/, '')}/api/admin/students/import`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'x-admin-key': adminKey,
        'content-type': 'text/csv',
      },
      body: csv,
      cache: 'no-store',
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { error: payload?.error || 'Student import failed' },
        { status: response.status },
      );
    }

    return NextResponse.json(payload);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
