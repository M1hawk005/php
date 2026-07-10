import ProjectCard from '@/components/ProjectCard';
import { getProjects } from '@/lib/markdown';

export default async function ProjectsPage() {
    const markdownProjects = getProjects();
    const projects = markdownProjects.map(p => ({
        id: p.slug,
        slug: p.slug, // Pass slug down so ProjectCard can link to it
        name: p.frontmatter.title || p.slug,
        description: p.frontmatter.description || p.content.slice(0, 150) + '...',
        link: p.frontmatter.link || '',
        githubUrl: p.frontmatter.githubUrl || '',
        techStack: p.frontmatter.techStack || []
    }));

    return (
        <main className="min-h-screen pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-foreground">My Projects</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project: any) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        </main>
    );
}