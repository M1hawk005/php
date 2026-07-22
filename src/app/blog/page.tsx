import { getBlogs } from "@/lib/markdown";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function BlogsPage() {
    const blogs = getBlogs();

    return (
        <main className="min-h-screen pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="mb-12">
                <h1 className="mb-2 font-mono text-4xl font-bold">/Blog/</h1>
                <p className="text-muted-foreground mt-4">Thoughts, tutorials, and insights.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map((blog) => (
                    <Link key={blog.slug} href={`/blog/${blog.slug}?from=blog`} className="block group">
                        <Card className='flex flex-col h-full bg-background backdrop-blur-md border border-border/50 group-hover:border-primary/50 transition-all duration-300 transform-gpu group-hover:-translate-y-1'>
                            <CardHeader>
                                <div className="text-xs text-muted-foreground mb-2 font-mono">{blog.frontmatter.date}</div>
                                <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{blog.frontmatter.title || blog.slug}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-foreground/80 leading-relaxed">{blog.frontmatter.summary || blog.content.slice(0, 100) + '...'}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
            {blogs.length === 0 && (
                <p className="text-center text-muted-foreground p-8">No posts yet.</p>
            )}
        </main>
    );
}
