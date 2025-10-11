import { projects } from '@/data/projects'; 
import ProjectCard from '@/components/ProjectCard'; 


export default function ProjectsPage() {
    return(
        <main>
            <h1 className="text-4xl font-bold">My Projects</h1>
            <div className='mt-8 grid grid-cols-1 md:grid:cols-2 lg:grid-cold-3 gap-8 '>
                {projects.map((project) => (
                <div key={project.name}>
                    <ProjectCard key={project.name} project={project} />
                </div>
                    ))
                }
            </div> 
        </main>
    );
}