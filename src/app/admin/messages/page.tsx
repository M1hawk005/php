'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';

type Message = {
    id: string;
    name: string;
    email: string;
    message: string;
    created_at: string;
};

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchMessages() {
        setLoading(true);
        const { data } = await supabase
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false });

        setMessages(data || []);
        setLoading(false);
    }

    useEffect(() => {
        fetchMessages();
    }, []);

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this message?')) return;

        const { error } = await supabase.from('messages').delete().eq('id', id);
        if (error) {
            alert('Failed to delete message');
        } else {
            setMessages(messages.filter(m => m.id !== id));
        }
    }

    if (loading) return <div>Loading messages...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Messages</h1>
                <button
                    onClick={() => fetchMessages()}
                    className="px-4 py-2 bg-[#222] hover:bg-[#333] rounded-lg text-sm transition-colors"
                >
                    Refresh
                </button>
            </div>

            <div className="grid gap-4">
                {messages.length === 0 ? (
                    <p className="text-gray-500">No messages found.</p>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className="bg-[#111] border border-[#333] p-6 rounded-xl hover:border-primary/30 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white">{msg.name}</h3>
                                    <a href={`mailto:${msg.email}`} className="text-primary hover:underline text-sm">{msg.email}</a>
                                </div>
                                <span className="text-xs text-gray-500 font-mono">
                                    {format(new Date(msg.created_at), 'PP p')}
                                </span>
                            </div>
                            <p className="text-gray-300 bg-black/50 p-4 rounded-lg border border-[#222]">
                                {msg.message}
                            </p>
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => handleDelete(msg.id)}
                                    className="text-red-500 hover:text-red-400 text-sm flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
