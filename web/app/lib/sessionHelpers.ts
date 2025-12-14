// This file is a part of AlphaGameBot.
//
//     AlphaGameBot - A Discord bot that's free and (hopefully) doesn't suck.
//     Copyright (C) 2025  Damien Boisvert (AlphaGameDeveloper)
//
//     AlphaGameBot is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.
//
//     AlphaGameBot is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.
//
//     You should have received a copy of the GNU General Public License
//     along with AlphaGameBot.  If not, see <https://www.gnu.org/licenses/>.

"use server";

import type { Session } from '@prisma/client';
import type { NextRequest } from 'next/server';
import db from './database';
import { hashToken } from './session';

/**
 * Parse the `agb_session` cookie from a request, validate it against the DB,
 * check expiry and return the Prisma Session record or null.
 */
export async function getSessionFromRequest(req: NextRequest): Promise<Session | null> {
    const cookie = req.headers.get('cookie') || '';
    const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('agb_session='));
    if (!match) return null;

    const raw = match.replace('agb_session=', '');
    const hashed = hashToken(raw);

    const session = await db.session.findFirst({ where: { hashedId: hashed } });
    if (!session) return null;

    if (new Date(session.expires_at) < new Date()) {
        // expired - cleanup and return null
        await db.session.deleteMany({ where: { hashedId: hashed } });
        return null;
    }

    return session;
}
