'use client';

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Trash2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ThreadCardProps {
    id: string;
    title?: string | null;
    content: string;
    imageUrl?: string | null;
    createdAt: string;
    replyCount: number;
}

export default function ThreadCard({ id, title, content, imageUrl, createdAt, replyCount }: ThreadCardProps) {
    const [canDelete, setCanDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedKeys = JSON.parse(localStorage.getItem('php_forum_keys') || '{}');
        if (storedKeys[id]) {
            setCanDelete(true);
        }
    }, [id]);

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation to thread
        if (!confirm('Are you sure you want to delete this thread?')) return;

        setIsDeleting(true);
        const storedKeys = JSON.parse(localStorage.getItem('php_forum_keys') || '{}');
        const secretKey = storedKeys[id];

        try {
            const response = await fetch('/api/forum/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    type: 'thread',
                    secretKey,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete');
            }

            // Remove key from local storage
            delete storedKeys[id];
            localStorage.setItem('php_forum_keys', JSON.stringify(storedKeys));

            router.refresh();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete thread');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Link href={`/forum/${id}`} className="block group relative">
            <div className="h-full p-4 rounded-md border border-border bg-card hover:border-primary/50 transition-colors flex flex-col">
                <div className="flex items-start gap-4 mb-3">
                    {imageUrl ? (
                        <div className="relative w-24 h-24 flex-none bg-muted rounded overflow-hidden">
                            <Image
                                src={imageUrl}
                                alt="Thread thumbnail"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    ) : (
                        <div className="w-24 h-24 flex-none bg-muted/20 rounded flex items-center justify-center text-muted-foreground text-xs text-center p-2">
                            No Image
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                            {title || "Untitled Thread"}
                        </h3>
                        <div className="text-xs text-muted-foreground mb-2 flex justify-between items-center">
                            <span>Anonymous • {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3 font-mono">
                            {content}
                        </p>
                    </div>
                </div>

                <div className="mt-auto pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        {replyCount} Replies
                    </span>
                    <div className="flex items-center gap-3">
                        {canDelete && (
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="text-red-500 hover:text-red-700 z-10 p-1 hover:bg-red-500/10 rounded transition-colors"
                                title="Delete Thread"
                            >
                                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                        )}
                        <span className="group-hover:text-primary transition-colors">View Thread &rarr;</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
