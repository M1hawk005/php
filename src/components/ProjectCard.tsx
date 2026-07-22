import {
    Card,
    CardHeader,
    CardTitle,

    CardContent,
    CardFooter
} from "@/components/ui/card"

import Link from "next/link";
import type { Project } from "@/data/projects";
type ProjectCardProps = {
    project: Project;
    compact?: boolean;
    source?: "projects" | "featured";
}

export default function ProjectCard({ project, compact, source = "projects" }: ProjectCardProps) {
    const projectHref = `/projects/${project.slug || project.id}${source === "featured" ? "?from=home&view=featured-projects" : "?from=projects"}`;

    return (
        <Card className={`flex flex-col relative overflow-hidden bg-background/50 backdrop-blur-md border border-border/50 hover:border-primary/50 transition-all duration-300 group hover:-translate-y-1 p-0 gap-0 ${compact ? 'h-full' : ''}`}>
            <Link href={projectHref} className="absolute inset-0 z-10" aria-label={`View details for ${project.name}`}></Link>
            <CardHeader className={`relative z-0 ${compact ? 'p-3 pb-1 md:p-4 md:pb-2' : 'p-6 pb-4'}`}>
                <CardTitle className={`font-bold text-foreground group-hover:text-primary transition-colors duration-300 relative z-0 ${compact ? 'text-base md:text-lg' : 'text-lg'}`}>{project.name}</CardTitle>
                {project.techStack && project.techStack.length ? (
                    <div className={`mt-2 ${compact ? 'hidden md:block' : ''}`}>
                        {!compact && <p className="text-[10px] text-muted-foreground mb-2 font-mono uppercase tracking-wider">Tech Stack</p>}
                        <div className="flex flex-wrap gap-2">
                            {project.techStack.map((tech, index) => (
                                <span
                                    key={index}
                                    className="text-xs font-medium text-muted-foreground bg-muted/30 px-2 py-1 rounded-sm hover:text-primary hover:bg-primary/10 transition-colors border border-border/30"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                ) : null}
            </CardHeader>

            <CardContent className={`relative z-0 pt-0 flex-1 ${compact ? 'p-3 pt-0 md:p-4' : 'p-6'}`}>
                <p className={`text-foreground/90 leading-relaxed ${compact ? 'text-xs line-clamp-2 md:line-clamp-3' : 'text-sm'}`}>{project.description}</p>
            </CardContent>

            {project.link || project.githubUrl ? (
                <CardFooter className={`border-t border-border/30 flex flex-wrap gap-x-2 gap-y-2 relative z-20 bg-background/50 backdrop-blur-sm pointer-events-auto ${compact ? 'hidden md:flex p-2' : 'flex p-4'}`}>
                    {project.link ? (
                        <Link
                            href={project.link}
                            className='relative z-20 text-sm text-muted-foreground hover:text-primary transition-all duration-300 font-medium flex items-center gap-1.5 group/link hover:underline underline-offset-4 min-h-[44px] px-2 rounded-md hover:bg-muted/50'
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
                            className='relative z-20 text-sm text-muted-foreground hover:text-primary transition-all duration-300 font-medium flex items-center gap-1.5 group/link hover:underline underline-offset-4 min-h-[44px] px-2 rounded-md hover:bg-muted/50'
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
            ) : null}

        </Card>
    );
}
