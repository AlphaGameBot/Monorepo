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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "discord.js";

export default function WebAppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        fetch('/api/auth/session')
            .then((res) => res.json())
            .then((data) => {
                if (!data.user) {
                    window.location.href = '/api/auth/login';
                } else {
                    setUser(data.user);
                    setLoading(false);
                }
            })
            .catch(() => {
                window.location.href = '/api/auth/login';
            });
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg)' }}>
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" 
                        style={{ borderColor: 'var(--primary-500)', borderTopColor: 'transparent' }}></div>
                    <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text-default)' }}>
            {/* Top Bar */}
            <header className="border-b" style={{ 
                background: 'var(--surface-100)', 
                borderColor: 'var(--border)' 
            }}>
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="text-xl font-bold">
                            AlphaGame<span style={{ color: 'var(--primary-500)' }}>Bot</span>
                        </Link>
                        <span style={{ color: 'var(--text-muted)' }}>/</span>
                        <span style={{ color: 'var(--text-muted)' }}>Dashboard</span>
                    </div>

                    {user && (
                        <div className="flex items-center gap-3">
                            <img
                                src={
                                    user.avatar
                                        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith("a_") ? "gif" : "png"}?size=64`
                                        : `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png`
                                }
                                alt={`${user.username} avatar`}
                                className="w-10 h-10 rounded-full border"
                                style={{ borderColor: 'var(--border)' }}
                            />
                            <div className="hidden md:block">
                                <div className="text-sm font-medium">{user.username}</div>
                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    #{user.discriminator}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <div className="flex flex-1">
                {/* Right Side Navigation */}
                <nav className="w-64 border-r p-6" style={{ 
                    background: 'var(--surface-100)', 
                    borderColor: 'var(--border)' 
                }}>
                    <ul className="space-y-2">
                        <li>
                            <Link
                                href="/webapp"
                                className={`block px-4 py-2 rounded transition ${
                                    pathname === '/webapp' 
                                        ? 'font-medium' 
                                        : ''
                                }`}
                                style={{
                                    background: pathname === '/webapp' ? 'var(--primary-500)' : 'transparent',
                                    color: pathname === '/webapp' ? 'white' : 'var(--text-default)',
                                }}
                            >
                                Servers
                            </Link>
                        </li>
                        <li>
                            <a
                                href="/"
                                className="block px-4 py-2 rounded transition"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                Back to Website
                            </a>
                        </li>
                        <li>
                            <a
                                href="/api/auth/logout"
                                className="block px-4 py-2 rounded transition"
                                style={{ color: 'var(--danger-500)' }}
                            >
                                Sign Out
                            </a>
                        </li>
                    </ul>
                </nav>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
