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

import { hashToken } from '@/app/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/database';

interface DiscordGuild {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string;
}

export async function GET(req: NextRequest) {
    const cookie = req.headers.get('cookie') || '';
    const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('agb_session='));
    if (!match) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    try {
        const raw = match.replace('agb_session=', '');
        const hashed = hashToken(raw);
        const session = await db.session.findFirst({ where: { hashedId: hashed } });
        
        if (!session || !session.access_token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }
        
        if (new Date(session.expires_at) < new Date()) {
            await db.session.deleteMany({ where: { hashedId: hashed } });
            return NextResponse.json({ error: 'Session expired' }, { status: 401 });
        }

        // Fetch guilds from Discord API
        const res = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${session.access_token}` }
        });

        if (!res.ok) {
            return NextResponse.json({ error: 'Failed to fetch guilds' }, { status: res.status });
        }

        const guilds = await res.json() as DiscordGuild[];

        // Filter guilds where user has administrator permission
        // Discord permission bit for ADMINISTRATOR is 0x8
        const adminGuilds = guilds.filter(guild => {
            const permissions = BigInt(guild.permissions);
            return (permissions & BigInt(0x8)) === BigInt(0x8) || guild.owner;
        });

        // Check which guilds have AlphaGameBot
        const guildIds = adminGuilds.map(g => g.id);
        const botGuilds = await db.guild.findMany({
            where: { id: { in: guildIds } },
            select: { id: true, name: true, updated_at: true }
        });

        const botGuildIds = new Set(botGuilds.map(g => g.id));

        // Return guilds with bot status
        const guildsWithBotStatus = adminGuilds.map(guild => ({
            id: guild.id,
            name: guild.name,
            icon: guild.icon,
            hasBot: botGuildIds.has(guild.id),
            dbInfo: botGuilds.find(bg => bg.id === guild.id)
        }));

        // Only return guilds that have the bot
        const mutualGuilds = guildsWithBotStatus.filter(g => g.hasBot);

        return NextResponse.json({ guilds: mutualGuilds });
    } catch (error) {
        console.error('Error fetching guilds:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
