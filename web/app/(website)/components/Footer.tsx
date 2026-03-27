// Copyright (c) 2025 Damien Boisvert (AlphaGameDeveloper)
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use client";

import SystemStatus from "./parts/SystemStatus";

function relativeTimeString(date: Date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) return "Unknown";

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (!isFinite(diff)) return "Unknown";
    if (diff < 1000) return "just now";

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years !== 1 ? "s" : ""} ago`;
    if (months > 0) return `${months} month${months !== 1 ? "s" : ""} ago`;
    if (weeks > 0) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
    if (days > 0) return `${days} day${days !== 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
}

export default function Footer() {
    return (
        <footer className="py-12" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="container">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    <div className="text-center md:text-left">
                        <div className="mb-2 text-xl font-bold" style={{ color: 'var(--primary-500)' }}>AlphaGameBot</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                            © 2025 AlphaGameBot. Some Rights Reserved. <br />
                            Another far-minded project by{" "}
                            <a href="https://linkedin.com/in/damienboisvert" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Damien Boisvert</a>.

                        </p>
                    </div>

                    <SystemStatus />

                    <div className="flex gap-6">
                        <a
                            href="https://github.com/AlphaGameBot"
                            className="transition-colors hover:text-primary-500"
                            style={{ color: 'var(--text-muted)' }}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub
                        </a>
                        <a
                            href="https://discord.gg/alphagamebot"
                            className="transition-colors hover:text-primary-500"
                            style={{ color: 'var(--text-muted)' }}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Discord
                        </a>
                        <a
                            href="/docs"
                            className="transition-colors hover:text-primary-500"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            Docs
                        </a>
                    </div>

                </div>
                <div className="relative w-full h-0 pointer-events-none" aria-hidden="true">
                    <div
                        className="absolute right-0 bottom-0 text-[11px] leading-none"
                        style={{ color: 'var(--text-muted)', opacity: 0.2 }}
                    >
                        Version: {process.env.NEXT_PUBLIC_VERSION} | Git SHA: {process.env.NEXT_PUBLIC_GIT_SHA!.substring(0, 7)} | Built: {relativeTimeString(new Date(Number(process.env.NEXT_PUBLIC_BUILD_TIMESTAMP!) * 1000))}
                    </div>
                </div>
            </div>
        </footer >
    );
}