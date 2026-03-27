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

import winston, { createLogger, format, type Logger, transports } from "winston";

// Winston's default logger levels are bullshit.
const logConfig = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        verbose: 4,
        debug: 3,
        silly: 5,
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        verbose: 'cyan',
        debug: 'blue',
        silly: 'magenta',
    },
};

export enum LoggerNames {
    METRICS = "metrics",
    WEB = "web",
    API = "api"
}

function shouldWeUseColors(): boolean {
    // Check if we're in a Node.js environment with stdout
    if (typeof process !== 'undefined' && process.stdout) {
        return process.stdout.isTTY && !(process.env.NO_COLOR);
    }
    return false;
}

winston.addColors(logConfig.colors);

const rootLogger = createLogger({
    levels: logConfig.levels,
    level: process.env.NODE_ENV === "production" ? "info" : (process.env.VERBOSE ? "verbose" : "debug"),
    // [file:line] [level]: message
    format: format.combine(
        shouldWeUseColors() ? format.colorize() : format.uncolorize(),
        format.timestamp(),
        format.printf(({ timestamp, level, message, ...metadata }): string => {
            const shouldIncludeTimestamp = process.env.NODE_ENV === "production";

            let msg = "";

            if (shouldIncludeTimestamp) {
                msg += `[${timestamp}] `;
            }

            let levelText = "";

            if (metadata.label) {
                levelText += `[${metadata.label}/${level}]`;
            } else {
                levelText += `[${level}]`;
            }
            msg += `${levelText}: ${message}`;

            return msg;
        })
    ),
    transports: [
        new (transports.Console)({
            silent: process.env.NODE_ENV === "test"
        })
    ]
});

export function getLogger(name: string, ...options: unknown[]): Logger {
    return rootLogger.child({ label: name, ...options });
}

const logger = getLogger("root");

if (typeof process !== 'undefined' && process.stdout && !process.stdout.isTTY) {
    logger.warn("Output doesn't seem to be a TTY.  Several features have been disabled.");
}

export default logger;
