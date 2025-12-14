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
import { REST } from 'discord.js';
import client from './database';

export async function createDiscordRestClient(session: Session): Promise<REST> {
    if (!session || !session.access_token) {
        throw new Error('Invalid session');
    } else if (new Date(session.expires_at) < new Date()) {
        await client.session.deleteMany({ where: { id: session.id } });
        throw new Error('Session expired');
    }

    return new REST({ version: '10', authPrefix: 'Bearer' }).setToken(session.access_token);
}