import { hashToken } from '@/app/lib/session';
import crypto from 'crypto';
import type { User } from 'discord.js';
import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/database';
import { getLogger } from '@/app/lib/logging/logger';

const logger = getLogger('api/auth/callback');

async function fetchToken(code: string) {
    const params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID || '',
        client_secret: process.env.DISCORD_CLIENT_SECRET || '',
        grant_type: 'authorization_code',
        code,
        redirect_uri: (process.env.NEXT_PUBLIC_BASE_URL || '') + '/api/auth/callback'
    });

    const res = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
    });
    return res.json();
}

async function fetchUser(access_token: string) {
    const res = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${access_token}` }
    });
    return res.json() as unknown as User;
}

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    if (!code) {
        logger.warn('OAuth callback called without code parameter');
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    try {
        logger.debug('Fetching OAuth token');
        const token = await fetchToken(code);
        if (token.error) throw token;

        logger.debug('Fetching user info from Discord');
        const user = await fetchUser(token.access_token);

        const res = NextResponse.redirect(new URL(process.env.NEXT_PUBLIC_BASE_URL || '/'));

        const raw = crypto.randomBytes(32).toString('hex');
        const hashed = hashToken(raw);

        const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
        
        logger.debug(`Upserting user ${user.username} (${user.id}) to database`);
        await db.user.upsert({
            where: { id: user.id },
            update: { username: user.username, discriminator: user.discriminator, last_login: new Date() },
            create: { id: user.id, username: user.username, discriminator: user.discriminator }
        });

        logger.debug('Creating session in database');
        await db.session.create({
            data: {
                hashedId: hashed,
                user_id: user.id,
                user_json: user,
                expires_at: expires
            }
        });

        const cookie = `agb_session=${raw}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7};`;
        res.headers.append('Set-Cookie', cookie);
        
        logger.info(`User ${user.username} (${user.id}) successfully authenticated`);
        return res;
    } catch (err) {
        logger.error('OAuth callback failed:', err);
        return NextResponse.json({ error: 'OAuth callback failed', detail: JSON.stringify(err) }, { status: 500 });
    }
}
