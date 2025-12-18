// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { PrismaClient } from "@prisma/client";
import { getLogger } from "./logging/logger";

const logger = getLogger("database");

declare global {
    interface Window {
        _prismaClient?: PrismaClient;
    }
}

const client = new PrismaClient({
    log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
    ],
});

// Forward Prisma logs to Winston
client.$on('warn', (e: { message: string }) => {
    logger.warn(`Prisma: ${e.message}`);
});

client.$on('error', (e: { message: string }) => {
    logger.error(`Prisma: ${e.message}`);
});

logger.info("Database client initialized");

export default client;