'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { sendMessage } from '@/actions/contact';

export default function ContactModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Handle hash change
    useEffect(() => {
        const checkHash = () => {
            setIsOpen(window.location.hash === '#contact');
        };
        
        // Initial check
        checkHash();
        
        window.addEventListener('hashchange', checkHash);
        return () => window.removeEventListener('hashchange', checkHash);
    }, []);

    const closeModal = () => {
        setIsOpen(false);
        // Remove hash from URL without scrolling
        history.replaceState(null, "", window.location.pathname + window.location.search);
        
        // Reset form state after close animation
        setTimeout(() => {
            setSuccess(false);
            setError(null);
        }, 300);
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData(e.currentTarget);
        
        try {
            const result = await sendMessage(formData);

            if (result.error) throw new Error(result.error);

            setSuccess(true);
            (e.target as HTMLFormElement).reset();
        } catch (err) {
            console.error('Error sending message:', err);
            setError('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border w-full max-w-3xl rounded-lg shadow-xl overflow-hidden relative animate-in zoom-in-95 duration-200">
                <button 
                    onClick={closeModal}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>
                
                <div className="p-8 md:p-12">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-foreground mb-2">Get in Touch</h2>
                        <p className="text-sm text-muted-foreground">
                            Feel free to reach out for collaborations, questions, or just to say hello!
                        </p>
                    </div>

                    {success ? (
                        <div className="text-center py-8 space-y-4 animate-in fade-in duration-500">
                            <div className="w-16 h-16 bg-muted text-foreground rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Message Sent!</h3>
                            <p className="text-sm text-muted-foreground">Thanks for reaching out. I'll get back to you soon.</p>
                            <button
                                onClick={closeModal}
                                className="mt-6 px-6 py-2 bg-muted hover:bg-primary/10 text-foreground hover:text-primary transition-colors border border-border rounded-lg"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium text-muted-foreground">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        required
                                        className="w-full px-4 py-3 bg-background border border-border rounded-md focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50 text-foreground text-sm"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        required
                                        className="w-full px-4 py-3 bg-background border border-border rounded-md focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50 text-foreground text-sm"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 mt-6">
                                <label htmlFor="message" className="text-sm font-medium text-muted-foreground">Message</label>
                                <textarea
                                    name="message"
                                    id="message"
                                    required
                                    rows={6}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-md focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground/50 text-foreground text-sm resize-none"
                                    placeholder="Type your message here..."
                                />
                            </div>

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-md text-sm mt-4">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 mt-6 bg-background border border-border hover:border-primary text-foreground hover:text-primary hover:bg-primary/5 font-medium rounded-md transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : "Send Message"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
