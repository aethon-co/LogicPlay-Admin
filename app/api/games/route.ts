import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { getPresignedUrl } from '@/app/lib/s3';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, gradeLevel, description, subject, gameFileKey, thumbnailKey, fileName } = body;

        if (!name || !gradeLevel || !subject || !gameFileKey) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Insert into Postgres - storing KEYS in the URL columns
        const query = `
            INSERT INTO games (name, grade_level, description, subject, file_url, thumbnail_url, file_name)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [name, parseInt(gradeLevel, 10), description, subject, gameFileKey, thumbnailKey, fileName];

        const { rows } = await pool.query(query, values);
        const newGame = rows[0];

        // Sign the URLs for the response so the frontend can use them immediately
        newGame.file_url = await getPresignedUrl(newGame.file_url);
        if (newGame.thumbnail_url) {
            newGame.thumbnail_url = await getPresignedUrl(newGame.thumbnail_url);
        }

        return NextResponse.json({ success: true, game: newGame }, { status: 201 });
    } catch (error: any) {
        console.error('Error uploading game:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const query = `SELECT * FROM games ORDER BY created_at DESC;`;
        const { rows } = await pool.query(query);

        // Map over games and sign URLs
        const signedGames = await Promise.all(rows.map(async (game) => {
            return {
                ...game,
                file_url: await getPresignedUrl(game.file_url),
                thumbnail_url: game.thumbnail_url ? await getPresignedUrl(game.thumbnail_url) : null
            };
        }));

        return NextResponse.json({ games: signedGames });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
