import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "@/components/ui/card"

import Link from "next/link";
import type { Project } from "@/data/projects";
type ProjectCardProps = {
    project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
    return (
        <Card className='flex flex-col h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 group'>
            <CardHeader>
                <CardTitle className="text-xl text-accent group-hover:text-primary transition-colors">{project.name}</CardTitle>
                {project.techStack && project.techStack.length ? (
                    <CardDescription className="text-muted-foreground">
                        <strong className="text-foreground/80">Tech Stack:</strong> {project.techStack.join(', ')}
                    </CardDescription>
                ) : null}
            </CardHeader>
            <CardContent className="flex-1">
                <p className="text-foreground/80 leading-relaxed">{project.description}</p>
            </CardContent>
            <CardFooter className="border-t border-border/30 pt-4 flex gap-4">
                {project.link ? (
                    <Link href={project.link} className='text-secondary hover:text-accent hover:underline transition-colors'>
                        View Live
                    </Link>
                ) : null}

                {project.githubUrl ? (
                    <Link href={project.githubUrl} className='text-secondary hover:text-accent hover:underline transition-colors'>
                        Github
                    </Link>
                ) : null}
            </CardFooter>

        </Card>
    );
}