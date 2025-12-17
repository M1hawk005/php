'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

type Project = {
    id: number;
    name: string;
    description: string;
    techStack: string[];
};

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    async function fetchProjects() {
        setLoading(true);
        const { data } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        setProjects(data || []);
        setLoading(false);
    }

    async function handleDelete(id: number) {
        if (!confirm('Are you sure you want to delete this project?')) return;

        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) {
            alert('Failed to delete project: ' + error.message);
        } else {
            setProjects(projects.filter(p => p.id !== id));
        }
    }

    if (loading) return <div>Loading projects...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Projects</h1>
                <Link
                    href="/admin/projects/new"
                    className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-all"
                >
                    + Add New Project
                </Link>
            </div>

            <div className="grid gap-4">
                {projects.length === 0 ? (
                    <p className="text-gray-500">No projects found. Add one!</p>
                ) : (
                    projects.map((project) => (
                        <div key={project.id} className="bg-[#111] border border-[#333] p-6 rounded-xl hover:border-primary/30 transition-all flex justify-between items-center group">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {project.techStack?.map((t, idx) => (
                                        <span key={idx} className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-1 max-w-xl">{project.description}</p>
                            </div>

                            <div className="flex items-center gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                    href={`/admin/projects/${project.id}`}
                                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </Link>
                                <button
                                    onClick={() => handleDelete(project.id)}
                                    className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
