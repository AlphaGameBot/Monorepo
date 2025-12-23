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

import db from '@/app/lib/database';
import { createDiscordRestClient } from '@/app/lib/rest';
import { getSessionFromRequest } from '@/app/lib/sessionHelpers';
import { Routes } from 'discord.js';
import { NextRequest, NextResponse } from 'next/server';

interface DiscordGuild {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string;
}

export async function GET(req: NextRequest) {
    const session = await getSessionFromRequest(req);
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    try {
        const rest = await createDiscordRestClient(session);

        // Fetch guilds from Discord API using discord.js REST helper
        const guilds = await rest.get(Routes.userGuilds()) as unknown as DiscordGuild[];

        // Filter guilds where user has administrator permission (0x8) or is owner
        const adminGuilds = guilds.filter(guild => {
            const permissions = BigInt(guild.permissions);
            const hasAdminPermissions = (permissions & BigInt(0x8)) === BigInt(0x8);
            return hasAdminPermissions || guild.owner;
        });

        // Check which guilds have AlphaGameBot in the DB
        const guildIds = adminGuilds.map(g => g.id);
        const botGuilds = await db.guild.findMany({
            where: { id: { in: guildIds } },
            select: { id: true, name: true, updated_at: true }
        });
        const botGuildIds = new Set(botGuilds.map(g => g.id));

        const guildsWithBotStatus = adminGuilds.map(guild => ({
            id: guild.id,
            name: guild.name,
            icon: guild.icon,
            hasBot: botGuildIds.has(guild.id),
            dbInfo: botGuilds.find(bg => bg.id === guild.id)
        }));

        const mutualGuilds = guildsWithBotStatus.filter(g => g.hasBot);

        return NextResponse.json({ guilds: mutualGuilds });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching guilds:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
