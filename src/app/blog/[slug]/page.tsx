import { getBlogBySlug, getBlogs } from "@/lib/markdown";
import { notFound } from 'next/navigation';
import MarkdownArticle from '@/components/MarkdownArticle';
import ContextBackButton from '@/components/ContextBackButton';

export async function generateStaticParams() {
    const blogs = getBlogs();
    return blogs.map((blog) => ({
        slug: blog.slug,
    }));
}

type BlogPageProps = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ from?: string }>;
};

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
    const slug = (await params).slug;
    const source = await searchParams;
    const blog = getBlogBySlug(slug);
    
    if (!blog) {
        notFound();
    }

    return (
        <main className="min-h-screen pt-28 pb-12 px-4 md:px-8 max-w-3xl mx-auto">
            <ContextBackButton fallbackHref="/blog" label="Back to Blogs" preserveHistory={source.from === "blog"} />
            <article className="mx-auto mt-8">
                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{blog.frontmatter.title || blog.slug}</h1>
                    <time className="text-muted-foreground font-mono">{blog.frontmatter.date}</time>
                </header>
                <MarkdownArticle content={blog.content} />
            </article>
        </main>
    );
}
