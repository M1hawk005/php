import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { getTimelineBySlug, getTimelines } from '@/lib/markdown';
import ContextBackButton from '@/components/ContextBackButton';

export function generateStaticParams() {
    return getTimelines().map(entry => ({ slug: entry.slug }));
}

type TimelinePageProps = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ from?: string; view?: string }>;
};

export default async function TimelinePage({ params, searchParams }: TimelinePageProps) {
    const { slug } = await params;
    const source = await searchParams;
    const entry = getTimelineBySlug(slug);

    if (!entry) notFound();

    const { frontmatter, content } = entry;
    const view = source.view === "education" || source.view === "experience"
        ? source.view
        : frontmatter.category === "education" ? "education" : "experience";
    const backLabel = view === "education" ? "Back to Education" : "Back to Experience";

    return (
        <main className="min-h-screen px-4 pb-12 pt-28 md:px-8">
            <article className="mx-auto max-w-4xl">
                <ContextBackButton fallbackHref={`/?view=${view}`} label={backLabel} />

                <p className="mb-3 font-mono text-sm uppercase tracking-wider text-primary">
                    {frontmatter.category}
                </p>
                <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
                    {frontmatter.title || slug}
                </h1>
                <div className="mb-10 flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground">
                    {frontmatter.institution && <span>{frontmatter.institution}</span>}
                    {frontmatter.duration && <span>{frontmatter.duration}</span>}
                    {frontmatter.location && <span>{frontmatter.location}</span>}
                </div>

                {content.trim() && (
                    <div className="prose prose-invert max-w-none">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                )}

                {frontmatter.marksheetUrl && (
                    <a
                        href={frontmatter.marksheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-10 inline-flex text-primary hover:underline"
                    >
                        View Scorecard &rarr;
                    </a>
                )}
            </article>
        </main>
    );
}
