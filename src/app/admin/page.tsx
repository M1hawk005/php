'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ projects: 0, messages: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            const { count: projectCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
            const { count: messageCount } = await supabase.from('messages').select('*', { count: 'exact', head: true });

            setStats({
                projects: projectCount || 0,
                messages: messageCount || 0
            });
            setLoading(false);
        }

        fetchStats();
    }, []);

    if (loading) return <div className="text-gray-500">Loading stats...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Projects Card */}
                <div className="bg-[#111] border border-[#333] p-6 rounded-xl hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-400">Total Projects</h2>
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-white">{stats.projects}</p>
                </div>

                {/* Messages Card */}
                <div className="bg-[#111] border border-[#333] p-6 rounded-xl hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-gray-400">Total Messages</h2>
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-4xl font-bold text-white">{stats.messages}</p>
                </div>
            </div>
        </div>
    );
}
