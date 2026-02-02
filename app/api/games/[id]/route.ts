import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { getPresignedUrl, deleteFileFromS3 } from '@/app/lib/s3';

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
        const body = await request.json();

        // 1. Build Query dynamically
        const fields = [];
        const values = [];
        let paramIndex = 1;

        const { name, gradeLevel, description, subject, gameFileKey, thumbnailKey, fileName } = body;

        if (name) {
            fields.push(`name = $${paramIndex++}`);
            values.push(name);
        }

        if (gradeLevel) {
            fields.push(`grade_level = $${paramIndex++}`);
            values.push(parseInt(gradeLevel as string, 10));
        }

        if (description) {
            fields.push(`description = $${paramIndex++}`);
            values.push(description);
        }

        if (subject) {
            fields.push(`subject = $${paramIndex++}`);
            values.push(subject);
        }

        // Handle file uploads (keys)
        if (gameFileKey) {
            fields.push(`file_url = $${paramIndex++}`);
            values.push(gameFileKey);

            if (fileName) { // Should usually accompany a new file
                fields.push(`file_name = $${paramIndex++}`);
                values.push(fileName);
            }
        }

        if (thumbnailKey) {
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
