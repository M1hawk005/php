import type { Project } from '@/data/projects';
import ProjectCard from '@/components/ProjectCard';
import { supabase } from '@/lib/supabaseClient'


export default async function ProjectsPage() {
    const { data: projects, error } = await supabase
        .from('projects')
        .select('*');

    if (error || !projects) {
        return <p className='text-center p-8'>Could not load projects.</p>
    }

    return (
        <main className="min-h-screen pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-foreground">My Projects</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project: Project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        </main>
    );
}