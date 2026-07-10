import { getProjectBySlug, getProjects } from "@/lib/markdown";
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    const projects = getProjects();
    return projects.map((project) => ({
        slug: project.slug,
    }));
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
    const slug = (await params).slug;
    const project = getProjectBySlug(slug);
    
    if (!project) {
        notFound();
    }

    return (
        <main className="min-h-screen pt-28 pb-12 px-4 md:px-8 max-w-4xl mx-auto">
            <Link href="/projects" className="text-muted-foreground hover:text-primary mb-8 inline-flex items-center transition-colors">
                &larr; Back to Projects
            </Link>
            <article className="prose prose-invert lg:prose-xl mx-auto mt-8">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{project.frontmatter.title || project.slug}</h1>
                <div className="flex gap-4 mb-12">
                    {project.frontmatter.link && (
                        <a href={project.frontmatter.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Live Demo &rarr;
                        </a>
                    )}
                    {project.frontmatter.githubUrl && (
                        <a href={project.frontmatter.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            GitHub Repository &rarr;
                        </a>
                    )}
                </div>
                <ReactMarkdown>{project.content}</ReactMarkdown>
            </article>
        </main>
    );
}
