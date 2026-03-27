// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import client from "@/app/lib/database";
import { getLogger } from "@/app/lib/logging/logger";
import { NextResponse } from "next/server";

const logger = getLogger("api/system-status");

export async function GET() {
    logger.debug("Checking system status");
    const ok = await client.$executeRaw`SELECT 1`.catch((err: unknown) => {
        logger.error("Database health check failed:", err);
        return null;
    });
    if (ok === null) {
        logger.warn("System status degraded - database check failed");
        return NextResponse.json({ status: "degraded" });
    }
    logger.debug("System status operational");
    return NextResponse.json({ status: "operational" });
}