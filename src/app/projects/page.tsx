import type { Project } from '@/data/projects'; 
import ProjectCard from '@/components/ProjectCard'; 
import { supabase } from '@/lib/supabaseClient'


export default async function ProjectsPage() {
    const { data: projects, error } = await supabase
        .from('projects')
        .select('*');

    if (error || !projects) {
        return <p className='test-center p-8'>Could not load projects.</p>
    }

    return(
        <div className="h-screen bg-black text-white p-25"> 
            <main>
                <h1 className="text-4xl font-bold">My Projects</h1>
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project: Project) => (
                        <ProjectCard key={project.id} project={project} />
                        ))
                    }
                </div> 
            </main>
        </div>
    );
}