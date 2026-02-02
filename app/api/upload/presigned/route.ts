import { NextRequest, NextResponse } from 'next/server';
import { getPresignedUploadUrl } from '@/app/lib/s3';

export async function POST(request: NextRequest) {
    try {
        const { fileName, contentType, folder } = await request.json();

        if (!fileName || !contentType) {
            return NextResponse.json(
                { error: 'Missing fileName or contentType' },
                { status: 400 }
            );
        }

        const { url, key } = await getPresignedUploadUrl(fileName, contentType, folder);
        console.log('Presigned URL generated:', url);
        console.log('Key:', key);


        return NextResponse.json({ url, key });
    } catch (error: any) {
        console.error('Error generating presigned URL:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
