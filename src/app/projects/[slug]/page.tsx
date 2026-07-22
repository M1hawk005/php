import { getProjectBySlug, getProjects } from "@/lib/markdown";
import { notFound } from 'next/navigation';
import MarkdownArticle from '@/components/MarkdownArticle';
import ContextBackButton from '@/components/ContextBackButton';

export async function generateStaticParams() {
    const projects = getProjects();
    return projects.map((project) => ({
        slug: project.slug,
    }));
}

type ProjectPageProps = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ from?: string; view?: string }>;
};

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
    const slug = (await params).slug;
    const source = await searchParams;
    const project = getProjectBySlug(slug);
    
    if (!project) {
        notFound();
    }

    const fromFeaturedProjects = source.from === "home" && source.view === "featured-projects";

    return (
        <main className="min-h-screen pt-28 pb-12 px-4 md:px-8 max-w-4xl mx-auto">
            <ContextBackButton
                fallbackHref={fromFeaturedProjects ? "/?view=featured-projects" : "/projects"}
                label={fromFeaturedProjects ? "Back to Featured Projects" : "Back to Projects"}
                preserveHistory={source.from === "projects"}
            />
            <article className="mx-auto mt-8">
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
                <MarkdownArticle content={project.content} />
            </article>
        </main>
    );
}
