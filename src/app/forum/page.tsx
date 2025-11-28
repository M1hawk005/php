import { supabase } from "@/lib/supabaseClient";
import ThreadCard from "@/components/forum/ThreadCard";
import CreateThreadForm from "@/components/forum/CreateThreadForm";

export const revalidate = 0; // Disable caching for real-time feel

export default async function ForumPage() {
    const { data: threads, error } = await supabase
        .from('threads')
        .select('*')
        .order('bumped_at', { ascending: false });

    if (error) {
        console.error("Error fetching threads:", JSON.stringify(error, null, 2));
    }

    return (
        <main className="min-h-screen pt-28 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-primary mb-2 font-mono">/forum/</h1>
                <p className="text-muted-foreground">Anonymous Board. Be nice.</p>
            </div>

            <div className="mb-12">
                <CreateThreadForm />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {threads && threads.length > 0 ? (
                    threads.map((thread) => (
                        <ThreadCard
                            key={thread.id}
                            id={thread.id}
                            title={thread.title}
                            content={thread.content}
                            imageUrl={thread.image_url}
                            createdAt={thread.created_at}
                            replyCount={thread.reply_count || 0}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed border-border rounded-md">
                        No threads yet. Be the first to post!
                    </div>
                )}
            </div>
        </main>
    );
}