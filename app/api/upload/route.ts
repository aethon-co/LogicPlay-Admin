import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToS3 } from '@/app/lib/s3';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const folder = (formData.get('folder')?.toString() || 'games').trim();

        if (!(file instanceof File)) {
            return NextResponse.json(
                { error: 'File is required' },
                { status: 400 }
            );
        }

        const fileName = file.name || 'upload.bin';
        const contentType = file.type || 'application/octet-stream';
        const buffer = Buffer.from(await file.arrayBuffer());
        const key = await uploadFileToS3(buffer, fileName, contentType, folder);

        return NextResponse.json({ key }, { status: 200 });
    } catch (error: any) {
        console.error('Direct upload failed:', error);
        return NextResponse.json(
            { error: error.message || 'Upload failed' },
            { status: 500 }
        );
    }
}
