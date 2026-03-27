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

import { NextRequest, NextResponse } from "next/server";
import { getLogger } from "../logging/logger";
import { Metrics, metricsManager } from "../metrics/metrics";
import type { MetricDataMap } from "../interfaces/metrics/MetricDataMap";

/**
 * Wrapper for API routes that adds logging and metrics tracking
 */
export function withMetricsAndLogging(
    handler: (req: NextRequest) => Promise<Response | NextResponse>,
    routeName: string
) {
    const logger = getLogger(`api/${routeName}`);

    return async (req: NextRequest): Promise<Response | NextResponse> => {
        const startTime = performance.now();
        const method = req.method;
        const pathname = new URL(req.url).pathname;

        logger.debug(`${method} ${pathname}`);

        try {
            const response = await handler(req);
            const durationMs = performance.now() - startTime;
            const statusCode = response.status;

            // Submit metrics
            metricsManager.submitMetric<Metrics.API_REQUEST>(Metrics.API_REQUEST, {
                endpoint: pathname,
                method,
                statusCode,
                durationMs
            });

            logger.verbose(`${method} ${pathname} - ${statusCode} - ${durationMs.toFixed(2)}ms`);

            return response;
        } catch (error) {
            const durationMs = performance.now() - startTime;
            logger.error(`${method} ${pathname} failed after ${durationMs.toFixed(2)}ms:`, error);

            // Submit error metric
            const errorPayload: MetricDataMap[Metrics.APPLICATION_ERROR] = {
                name: error instanceof Error ? error.name : "Unknown",
                message: error instanceof Error ? error.message : String(error),
                ...(error instanceof Error && error.stack ? { stack: error.stack } : {})
            };
            metricsManager.submitMetric<Metrics.APPLICATION_ERROR>(Metrics.APPLICATION_ERROR, errorPayload);

            throw error;
        }
    };
}
