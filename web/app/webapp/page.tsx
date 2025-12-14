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

import { useEffect, useState } from "react";

interface Guild {
    id: string;
    name: string;
    icon: string | null;
    hasBot: boolean;
    dbInfo?: {
        id: string;
        name: string;
        updated_at: Date;
    };
}

export default function WebAppPage() {
    const [guilds, setGuilds] = useState<Guild[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/guilds')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch guilds');
                return res.json();
            })
            .then((data) => {
                setGuilds(data.guilds || []);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" 
                     style={{ borderColor: 'var(--primary-500)', borderTopColor: 'transparent' }}></div>
                <p style={{ color: 'var(--text-muted)' }}>Loading your servers...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-500 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-lg font-medium">Error loading servers</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{error}</p>
                </div>
            </div>
        );
    }

    if (guilds.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="mb-4" style={{ color: 'var(--text-muted)' }}>
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-lg font-medium" style={{ color: 'var(--text-default)' }}>No servers found</p>
                    <p className="text-sm mt-2">You don't have any servers where you're an administrator and AlphaGameBot is present.</p>
                    <div className="mt-6">
                        <a
                            href="https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-6 py-3 rounded font-medium transition"
                            style={{ background: 'var(--primary-500)', color: 'white' }}
                        >
                            Invite AlphaGameBot
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Your Servers</h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    Manage AlphaGameBot in servers where you have administrator permissions
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guilds.map((guild) => (
                    <div
                        key={guild.id}
                        className="rounded-lg border p-6 transition hover:border-opacity-50 cursor-pointer"
                        style={{
                            background: 'var(--surface-100)',
                            borderColor: 'var(--border)',
                        }}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            {guild.icon ? (
                                <img
                                    src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${guild.icon.startsWith("a_") ? "gif" : "png"}?size=64`}
                                    alt={`${guild.name} icon`}
                                    className="w-16 h-16 rounded-full"
                                />
                            ) : (
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                                    style={{ background: 'var(--surface-200)', color: 'var(--primary-500)' }}
                                >
                                    {guild.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold truncate">{guild.name}</h3>
                                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                    ID: {guild.id}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                className="flex-1 px-4 py-2 rounded font-medium transition"
                                style={{
                                    background: 'var(--primary-500)',
                                    color: 'white',
                                }}
                            >
                                Configure
                            </button>
                            <button
                                className="px-4 py-2 rounded border transition"
                                style={{
                                    borderColor: 'var(--border)',
                                    color: 'var(--text-muted)',
                                }}
                            >
                                Stats
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
