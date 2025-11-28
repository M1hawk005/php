import { supabase } from "@/lib/supabaseClient";
import Post from "@/components/forum/Post";
import ReplyForm from "@/components/forum/ReplyForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0;

interface ThreadPageProps {
    params: {
        threadId: string;
    };
}

export default async function ThreadPage({ params }: ThreadPageProps) {
    const { threadId } = params;

    // Fetch thread details (OP)
    const { data: thread, error: threadError } = await supabase
        .from('threads')
        .select('*')
        .eq('id', threadId)
        .single();

    if (threadError || !thread) {
        return (
            <main className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-4xl mx-auto text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Thread Not Found</h1>
                <Link href="/forum" className="text-primary hover:underline">
                    &larr; Back to Board
                </Link>
            </main>
        );
    }

    // Fetch replies
    const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

    if (postsError) {
        console.error("Error fetching posts:", postsError);
    }

    return (
        <main className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-4xl mx-auto">
            <div className="mb-6">
                <Link href="/forum" className="text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors mb-4">
                    <ArrowLeft size={16} />
                    Back to Board
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold text-primary break-words">
                    {thread.title || "Untitled Thread"}
                </h1>
            </div>

            <div className="space-y-1">
                {/* OP */}
                <Post
                    id={thread.id}
                    content={thread.content}
                    imageUrl={thread.image_url}
                    createdAt={thread.created_at}
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
                        createdAt={post.created_at}
                        index={index + 1}
                    />
                ))}
            </div>

            <ReplyForm threadId={threadId} />
        </main>
    );
}
