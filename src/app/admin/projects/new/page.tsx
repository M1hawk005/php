'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const link = formData.get('link') as string;
        const githubUrl = formData.get('githubUrl') as string;
        const techStackString = formData.get('techStack') as string;

        // Parse comma-separated tech stack
        const techStack = techStackString.split(',').map(t => t.trim()).filter(Boolean);

        try {
            const { error: insertError } = await supabase
                .from('projects')
                .insert([{
                    name,
                    description,
                    link: link || null,
                    githubUrl: githubUrl || null,
                    techStack
                }]);

            if (insertError) throw insertError;

            router.push('/admin/projects');
            router.refresh();
        } catch (err: any) {
            console.error('Error creating project:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/projects" className="text-gray-500 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <h1 className="text-3xl font-bold">New Project</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Project Name *</label>
                    <input
                        name="name"
                        required
                        className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-white"
                        placeholder="My Awesome App"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Description *</label>
                    <textarea
                        name="description"
                        required
                        rows={4}
                        className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-white resize-none"
                        placeholder="What does this project do?"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Live URL</label>
                        <input
                            name="link"
                            type="url"
                            className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-white"
                            placeholder="https://example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">GitHub URL</label>
                        <input
                            name="githubUrl"
                            type="url"
                            className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-white"
                            placeholder="https://github.com/..."
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Tech Stack (comma separated)</label>
                    <input
                        name="techStack"
                        className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-white"
                        placeholder="Next.js, TypeScript, Tailwind CSS"
                    />
                </div>

                {error && (
                    <div className="p-4 bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg">
                        {error}
                    </div>
                )}

                <div className="pt-4 flex justify-end gap-4">
                    <Link
                        href="/admin/projects"
                        className="px-6 py-3 bg-[#222] hover:bg-[#333] text-white font-medium rounded-lg transition-colors border border-[#333]"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-all"
                    >
                        {loading ? 'Creating...' : 'Create Project'}
                    </button>
                </div>
            </form>
        </div>
    );
}
