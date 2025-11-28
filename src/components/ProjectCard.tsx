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
        <Card className='flex flex-col h-full relative overflow-hidden bg-[#000000] backdrop-blur-md border border-accent/50 hover:border-accent transition-all duration-500 group hover:scale-[1.02] transform-gpu'>

            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <CardHeader className="relative z-10">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent group-hover:from-secondary group-hover:to-accent transition-all duration-300">{project.name}</CardTitle>
                {project.techStack && project.techStack.length ? (
                    <div className="mt-3">
                        <p className="text-xs text-muted-foreground mb-2 font-mono uppercase tracking-wider">Tech Stack</p>
                        <div className="flex flex-wrap gap-2">
                            {project.techStack.map((tech, index) => (
                                <span
                                    key={index}
                                    className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/30 text-accent hover:bg-accent/20 hover:border-accent/50 transition-all duration-300 hover:scale-105 transform-gpu"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : null}
            </CardHeader>

            <CardContent className="flex-1 relative z-10">
                <p className="text-foreground/90 leading-relaxed">{project.description}</p>
            </CardContent>

            <CardFooter className="border-t border-border/30 pt-4 flex gap-4 relative z-10 bg-[#000000]/50 backdrop-blur-sm">
                {project.link ? (
                    <Link
                        href={project.link}
                        className='text-secondary hover:text-accent transition-all duration-300 font-medium flex items-center gap-1.5 group/link hover:underline underline-offset-4'
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Live
                    </Link>
                ) : null}

                {project.githubUrl ? (
                    <Link
                        href={project.githubUrl}
                        className='text-secondary hover:text-accent transition-all duration-300 font-medium flex items-center gap-1.5 group/link hover:underline underline-offset-4'
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        GitHub
                    </Link>
                ) : null}
            </CardFooter>

        </Card>
    );
}