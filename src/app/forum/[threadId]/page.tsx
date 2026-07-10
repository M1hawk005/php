import { prisma } from "@/lib/prisma";
import Post from "@/components/forum/Post";
import ReplyForm from "@/components/forum/ReplyForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

interface ThreadPageProps {
    params: Promise<{
        threadId: string;
    }>;
}

export default async function ThreadPage({ params }: ThreadPageProps) {
    const { threadId } = await params;

    // Fetch thread details (OP)
    const thread = await prisma.thread.findUnique({
        where: { id: threadId },
        include: {
            posts: {
                orderBy: { created_at: 'asc' }
            }
        }
    });

    if (!thread) {
        return (
            <main className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-4xl mx-auto text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Thread Not Found</h1>
                <Link href="/forum" className="text-foreground hover:text-primary hover:underline">
                    &larr; Back to Board
                </Link>
            </main>
        );
    }

    const posts = thread.posts;

    return (
        <main className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-4xl mx-auto">
            <div className="mb-6">
                <Link href="/forum" className="text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors mb-4">
                    <ArrowLeft size={16} />
                    Back to Board
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground break-words">
                    {thread.title || "Untitled Thread"}
                </h1>
            </div>

            <div className="space-y-1">
                {/* OP */}
                <Post
                    id={thread.id}
                    content={thread.content}
                    imageUrl={thread.image_url}
                    createdAt={thread.created_at.toISOString()}
                    isOp={true}
                    index={0}
                />

                {/* Replies */}
                {posts && posts.map((post, index) => (
                    <Post
                        key={post.id}
                        id={post.id}
                        content={post.content}
                        imageUrl={post.image_url}
                        createdAt={post.created_at.toISOString()}
                        index={index + 1}
                    />
                ))}
            </div>

            <ReplyForm threadId={threadId} />
        </main>
    );
}
