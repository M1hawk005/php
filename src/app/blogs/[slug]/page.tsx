import { getBlogBySlug, getBlogs } from "@/lib/markdown";
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    const blogs = getBlogs();
    return blogs.map((blog) => ({
        slug: blog.slug,
    }));
}

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
    const slug = (await params).slug;
    const blog = getBlogBySlug(slug);
    
    if (!blog) {
        notFound();
    }

    return (
        <main className="min-h-screen pt-28 pb-12 px-4 md:px-8 max-w-3xl mx-auto">
            <Link href="/blogs" className="text-muted-foreground hover:text-primary mb-8 inline-flex items-center transition-colors">
                &larr; Back to Blogs
            </Link>
            <article className="prose prose-invert lg:prose-xl mx-auto mt-8">
                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{blog.frontmatter.title || blog.slug}</h1>
                    <time className="text-muted-foreground font-mono">{blog.frontmatter.date}</time>
                </header>
                <ReactMarkdown>{blog.content}</ReactMarkdown>
            </article>
        </main>
    );
}
