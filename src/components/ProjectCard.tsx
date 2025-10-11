import Link from 'next/link';
import type {Project} from '@/data/projects';

type ProjectCardProps = {
    project: Project;
}

export default function ProjectCard({project}: ProjectCardProps){
    return(
        <div className='border rounded-lg p-4 flex flex-col'>
            <h3 className='text-xl font-bold mb-2'>{project.name}</h3>
            <p className='text-gray-700 flex-grow'>{project.description}</p>

            <div className='mt-4'>
                <strong>Tech Stack:</strong> {project.techStack.join(', ')}
            </div>
            <div className='mt-4 flex space-x-4'>
                <Link href={project.link} className='text-blue-500 hover:underline'>
                    View Live 
                </Link>
                <Link href={project.githubUrl} className='text-blue-500 hover:underline'>
                    Github 
                </Link>
            </div>
                    
        </div>
    );
}