'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ContactPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const message = formData.get('message') as string;

        if (!name || !email || !message) {
            setError('Please fill in all fields.');
            setLoading(false);
            return;
        }

        try {
            const { error: insertError } = await supabase
                .from('messages')
                .insert([{ name, email, message }]);

            if (insertError) throw insertError;

            setSuccess(true);
            (e.target as HTMLFormElement).reset();
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="h-screen bg-black text-white pt-24 overflow-y-auto px-8 md:px-24 flex items-center justify-center">
            <div className="max-w-5xl w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-[var(--nav-cyan)] mb-2">Get in Touch</h1>
                    <p className="text-muted-foreground text-lg">
                        Feel free to reach out for collaborations, questions, or just to say hello!
                    </p>
                </div>

                <div className="bg-[#111111] border border-[#333] p-8 rounded-xl shadow-2xl backdrop-blur-sm">
                    {success ? (
                        <div className="text-center py-12 space-y-4 animate-in fade-in duration-500">
                            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/50">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white">Message Sent!</h3>
                            <p className="text-gray-400">Thanks for reaching out. I&apos;ll get back to you soon.</p>
                            <button
                                onClick={() => setSuccess(false)}
                                className="mt-6 px-6 py-2 bg-[#222] hover:bg-[#333] text-white rounded-lg transition-colors border border-[#444]"
                            >
                                Send Another
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium text-gray-300">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        required
                                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-gray-600 text-white"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        required
                                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-gray-600 text-white"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium text-gray-300">Message</label>
                                <textarea
                                    name="message"
                                    id="message"
                                    required
                                    rows={5}
                                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-gray-600 text-white resize-none"
                                    placeholder="Type your message here..."
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-[var(--nav-cyan)] hover:bg-[var(--nav-cyan)]/90 text-black font-bold rounded-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_20px_rgba(115,218,202,0.3)] hover:shadow-[0_0_30px_rgba(115,218,202,0.5)]"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Sending...
                                    </span>
                                ) : "Send Message"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}