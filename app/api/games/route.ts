import { NextRequest, NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { uploadFileToS3, getPresignedUrl } from '@/app/lib/s3';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const gradeLevel = formData.get('gradeLevel') as string;
        const description = formData.get('description') as string;
        const subject = formData.get('subject') as string;

        const gameFile = formData.get('file') as File;
        const thumbnailFile = formData.get('thumbnail') as File;

        if (!name || !gradeLevel || !subject || !gameFile) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const gameBytes = await gameFile.arrayBuffer();
        const gameBuffer = Buffer.from(gameBytes);
        // Returns the KEY now
        const gameFileKey = await uploadFileToS3(gameBuffer, `game-${gameFile.name}`, gameFile.type, 'games');

        let thumbnailKey = null;
        if (thumbnailFile) {
            const thumbBytes = await thumbnailFile.arrayBuffer();
            const thumbBuffer = Buffer.from(thumbBytes);
            thumbnailKey = await uploadFileToS3(thumbBuffer, `thumb-${thumbnailFile.name}`, thumbnailFile.type, 'thumbnails');
        }

        // Insert into Postgres - storing KEYS in the URL columns
        const query = `
            INSERT INTO games (name, grade_level, description, subject, file_url, thumbnail_url, file_name)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const values = [name, parseInt(gradeLevel, 10), description, subject, gameFileKey, thumbnailKey, gameFile.name];

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
