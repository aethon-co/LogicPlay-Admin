import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { uploadFileToS3, getPresignedUrl, deleteFileFromS3 } from '@/app/lib/s3';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // 1. Fetch game to get S3 keys
        const { rows } = await pool.query('SELECT file_url, thumbnail_url FROM games WHERE id = $1', [id]);

        if (rows.length > 0) {
            const game = rows[0];
            // 2. Delete from S3 (fire and forget, or await if strict)
            if (game.file_url) await deleteFileFromS3(game.file_url);
            if (game.thumbnail_url) await deleteFileFromS3(game.thumbnail_url);
        }

        // 3. Delete from DB
        const { rowCount } = await pool.query('DELETE FROM games WHERE id = $1', [id]);

        if (rowCount === 0) {
            // Optionally assume success if it didn't exist
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const formData = await request.formData();

        // 1. Build Query dynamically
        const fields = [];
        const values = [];
        let paramIndex = 1;

        const name = formData.get('name');
        if (name) {
            fields.push(`name = $${paramIndex++}`);
            values.push(name);
        }

        const gradeLevel = formData.get('gradeLevel');
        if (gradeLevel) {
            fields.push(`grade_level = $${paramIndex++}`);
            values.push(parseInt(gradeLevel as string, 10));
        }

        const description = formData.get('description');
        if (description) {
            fields.push(`description = $${paramIndex++}`);
            values.push(description);
        }

        const subject = formData.get('subject');
        if (subject) {
            fields.push(`subject = $${paramIndex++}`);
            values.push(subject);
        }

        // Handle file uploads
        const gameFile = formData.get('file') as File;
        if (gameFile && typeof gameFile !== 'string') {
            const gameBytes = await gameFile.arrayBuffer();
            const gameBuffer = Buffer.from(gameBytes);
            // Returns Key
            const gameFileKey = await uploadFileToS3(gameBuffer, `game-${gameFile.name}`, gameFile.type, 'games');

            fields.push(`file_url = $${paramIndex++}`);
            values.push(gameFileKey);
            fields.push(`file_name = $${paramIndex++}`);
            values.push(gameFile.name);
        }

        const thumbnailFile = formData.get('thumbnail') as File;
        if (thumbnailFile && typeof thumbnailFile !== 'string') {
            const thumbBytes = await thumbnailFile.arrayBuffer();
            const thumbBuffer = Buffer.from(thumbBytes);
            // Returns Key
            const thumbnailKey = await uploadFileToS3(thumbBuffer, `thumb-${thumbnailFile.name}`, thumbnailFile.type, 'thumbnails');

            fields.push(`thumbnail_url = $${paramIndex++}`);
            values.push(thumbnailKey);
        }

        if (fields.length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        // Add ID as last param
        values.push(id);
        const query = `
            UPDATE games 
            SET ${fields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *;
        `;

        const { rows } = await pool.query(query, values);

        if (rows.length === 0) {
            return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        const updatedGame = rows[0];
        // Sign URLs
        updatedGame.file_url = await getPresignedUrl(updatedGame.file_url);
        if (updatedGame.thumbnail_url) {
            updatedGame.thumbnail_url = await getPresignedUrl(updatedGame.thumbnail_url);
        }

        return NextResponse.json({ success: true, game: updatedGame });
    } catch (error: any) {
        console.error("Update error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
