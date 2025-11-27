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

    // Chunk projects into groups of 6
    const chunkSize = 6;
    const projectChunks = [];
    for (let i = 0; i < projects.length; i += chunkSize) {
        projectChunks.push(projects.slice(i, i + chunkSize));
    }

    return (
        <div className="h-screen bg-black text-white pt-20 overflow-hidden flex flex-col">
            {/* Fixed Heading */}
            <div className="flex-none px-8 md:px-24 pb-4 z-10 bg-black/50 backdrop-blur-sm">
                <h1 className="text-4xl font-bold text-primary">My Projects</h1>
            </div>

            {/* Scrollable Snap Container */}
            <div className="flex-1 overflow-y-auto snap-y snap-mandatory no-scrollbar scroll-smooth">
                {projectChunks.map((chunk, index) => (
                    <section key={index} className="h-full w-full snap-start flex flex-col px-8 md:px-24 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                            {chunk.map((project: Project) => (
                                <ProjectCard key={project.id} project={project} />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}