// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { exportMetricsToPrometheus } from "@/app/lib/metrics/exports/prometheus";
import { getLogger } from "@/app/lib/logging/logger";

const logger = getLogger("api/metrics");

export const runtime = 'nodejs';

export async function GET() {
    try {
        logger.debug("Metrics requested");
        const metrics = await exportMetricsToPrometheus();
        
        return new Response(metrics, {
            status: 200,
            headers: {
                "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
            },
        });
    } catch (error) {
        logger.error("Error collecting metrics:", error);
        return new Response("Error collecting metrics", {
            status: 500,
            headers: {
                "Content-Type": "text/plain",
            },
        });
    }
}
