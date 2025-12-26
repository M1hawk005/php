'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (signInError) throw signInError;

            // Middleware will handle redirection, but client-side router push is good too
            router.push('/admin');
            router.refresh();

        } catch (err: unknown) {
            console.error('Login error:', err);
            setError(err instanceof Error ? err.message : 'Failed to login');
        } finally {
            setLoading(false);
        }
    }

    // Only allow sign up in dev or manually? 
    // For now, assume user has signed up manually or I can add a hidden signup temporarily if needed?
    // The instructions said "You will need to Sign Up ... once the login page is ready". 
    // But I will create a LOGIN page. Sign up needs to be enabled in Supabase, but typically for admin implementations 
    // I prefer just using the console or a temporary signup form. 
    // Actually, I can add a "Sign Up" mode toggle just for the first time setup if the user wants.
    // But for a cleaner "Admin Panel" look, let's stick to Login. 
    // If the user hasn't signed up, they can't log in.
    // Wait, the plan said: "You will need to Sign Up ... once the login page is ready".
    // I should probably allow Sign Up here for the first time setup, or just tell them to use Supabase dashboard.
    // I'll stick to Login. If they need to Create Account, they can do it in Supabase dashboard easily.

    // Actually, I'll add a boolean flag to toggle "Sign Up" mode just in case they can't access dashboard easily.
    const [isSignUp, setIsSignUp] = useState(false);

    async function handleAuth(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { data, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (signUpError) throw signUpError;
                alert('Check your email for confirmation link!');
            } else {
                const { data, error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
                router.push('/admin');
                router.refresh();
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#111] border border-[#333] rounded-xl p-8 shadow-2xl">
                <h1 className="text-3xl font-bold text-center mb-8 text-primary">Admin Access</h1>

                <form onSubmit={handleAuth} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-black border border-[#333] rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-black border border-[#333] rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-white"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-all"
                    >
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-xs text-gray-500 hover:text-white transition-colors"
                    >
                        {isSignUp ? 'Already have an account? Login' : 'Need to create account? Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    );
}
