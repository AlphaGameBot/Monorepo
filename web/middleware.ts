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

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getLogger } from "./app/lib/logging/logger";
import { Metrics, metricsManager } from "./app/lib/metrics/metrics";

const logger = getLogger("middleware");

export function middleware(request: NextRequest) {
    const startTime = performance.now();
    const { pathname, search } = request.nextUrl;
    const method = request.method;
    const fullPath = pathname + search;

    logger.debug(`${method} ${fullPath}`);

    // Continue with the request
    const response = NextResponse.next();

    // Track metrics after response
    const durationMs = performance.now() - startTime;
    const statusCode = response.status;

    // Submit HTTP request metric
    metricsManager.submitMetric<Metrics.HTTP_REQUEST>(Metrics.HTTP_REQUEST, {
        method,
        path: pathname,
        statusCode,
        durationMs
    });

    // Submit API request metric for API routes
    if (pathname.startsWith("/api/")) {
        metricsManager.submitMetric<Metrics.API_REQUEST>(Metrics.API_REQUEST, {
            endpoint: pathname,
            method,
            statusCode,
            durationMs
        });
    }

    logger.verbose(`${method} ${fullPath} - ${statusCode} - ${durationMs.toFixed(2)}ms`);

    return response;
}

// Configure which paths the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
