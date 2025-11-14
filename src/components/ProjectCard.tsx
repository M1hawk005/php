import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "@/components/ui/card" 

import Link from "next/link";
import type {Project} from "@/data/projects";
type ProjectCardProps = {
    project: Project;
}

export default function ProjectCard({project}: ProjectCardProps){
    return(
        <Card className='flex flex-col rounded-none'>
            <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                {project.techStack && project.techStack.length ? (
                <CardDescription>
                        <strong>Tech Stack:</strong> {project.techStack.join(', ')}
                    </CardDescription>
                ): null }
            </CardHeader>      
            <CardContent>
                <p>{project.description}</p>
            </CardContent>
            <CardFooter>
                {project.link ? (
                    <Link href={project.link} className='text-blue-500 hover:underline'>
                        View Live 
                    </Link>
                ): null}

                {project.githubUrl ? (
                    <Link href={project.githubUrl} className='text-blue-500 hover:underline ml-4'>
                        Github
                    </Link>
                ): null}
            </CardFooter>
                    
        </Card>
    );
}