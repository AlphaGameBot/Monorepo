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

import { Events, WebhookClient, type Guild } from "discord.js";
import type { EventHandler } from "../interfaces/Event.js";
import prisma from "../utility/database.js";
import { getLogger } from "../utility/logging/logger.js";

const logger = getLogger("events/GuildCreate");

export default {
    name: Events.GuildCreate,
    execute: async (guild: Guild) => {
        logger.info(`Bot joined guild: ${guild.name} (${guild.id})`);
        
        // Ensure the guild exists in the database
        const result = await prisma.guild.upsert({
            where: { id: guild.id },
            create: { 
                id: guild.id, 
                name: guild.name 
            },
            update: { 
                name: guild.name 
            }
        }).catch((error) => {
            logger.error(`Failed to upsert guild ${guild.id} (${guild.name}):`, error);
        });

        // Was anything changed?
        // i.e, is created_at and update_at (roughly) the same?
        if (result) {
            const createdAt = result.created_at.getTime();
            const updatedAt = result.updated_at.getTime();
            const timeDiff = Math.abs(updatedAt - createdAt);

            // If the difference is less than 5 seconds, we consider it a new guild
            if (timeDiff < 5000) {
                logger.info(`New guild added to database: ${guild.name} (${guild.id})`);
                // send discord webhook notification to process.env.EFFOR_WEBHOOK_URL if defined
                const errorWebhookUrl = process.env.ERROR_WEBHOOK_URL;
                if (!errorWebhookUrl) return;

                const wh = new WebhookClient({ url: errorWebhookUrl });
                await wh.send({
                    content: `:tada: Bot has joined a new guild!\n\n**Guild Name:** ${guild.name}\n**Guild ID:** ${guild.id}\n**Member Count:** ${guild.memberCount}`,
                }).catch((error) => {
                    logger.error(`Failed to send guild join webhook for guild ${guild.id} (${guild.name}):`, error);
                });
            } else {
                logger.info(`Existing guild updated in database: ${guild.name} (${guild.id})`);
            }
        }
    }
} as EventHandler<Events.GuildCreate>;
