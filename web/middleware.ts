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

// Note: This middleware uses basic console logging as it runs in the Edge Runtime
// which doesn't support full Node.js APIs like Winston. Metrics are recorded
// in the API routes themselves which run in Node.js runtime.

export function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const method = request.method;
    const fullPath = pathname + search;

    // Basic console logging for middleware (Edge Runtime compatible)
    if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.log(`[middleware] ${method} ${fullPath}`);
    }

    // Continue with the request
    return NextResponse.next();
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
