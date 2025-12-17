'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        link: '',
        githubUrl: '',
        techStack: ''
    });

    useEffect(() => {
        async function fetchProject() {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                setError('Failed to load project');
                setLoading(false);
                return;
            }

            if (data) {
                setFormData({
                    name: data.name,
                    description: data.description,
                    link: data.link || '',
                    githubUrl: data.githubUrl || '',
                    techStack: data.techStack ? data.techStack.join(', ') : ''
                });
            }
            setLoading(false);
        }

        fetchProject();
    }, [id]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const techStack = formData.techStack.split(',').map(t => t.trim()).filter(Boolean);

        try {
            const { error: updateError } = await supabase
                .from('projects')
                .update({
                    name: formData.name,
                    description: formData.description,
                    link: formData.link || null,
                    githubUrl: formData.githubUrl || null,
                    techStack
                })
                .eq('id', id);

            if (updateError) throw updateError;

            router.push('/admin/projects');
            router.refresh();
        } catch (err: any) {
            console.error('Error updating project:', err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div>Loading project...</div>;

    return (
        <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/projects" className="text-gray-500 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <h1 className="text-3xl font-bold">Edit Project</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Project Name *</label>
                    <input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-white"
                        placeholder="My Awesome App"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Description *</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        rows={4}
                        className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-white resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Live URL</label>
                        <input
                            value={formData.link}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                            type="url"
                            className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">GitHub URL</label>
                        <input
                            value={formData.githubUrl}
                            onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                            type="url"
                            className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-white"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Tech Stack (comma separated)</label>
                    <input
                        value={formData.techStack}
                        onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                        className="w-full px-4 py-3 bg-[#111] border border-[#333] rounded-lg focus:ring-2 focus:ring-primary/50 outline-none text-white"
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
                        disabled={saving}
                        className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-all"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
