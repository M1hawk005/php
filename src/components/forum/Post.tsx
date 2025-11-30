'use client';

import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface PostProps {
    id: string;
    content: string;
    imageUrl?: string | null;
    createdAt: string;
    isOp?: boolean;
    index?: number;
}

export default function Post({ id, content, imageUrl, createdAt, isOp = false, index }: PostProps) {
    const [canDelete, setCanDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedKeys = JSON.parse(localStorage.getItem('php_forum_keys') || '{}');
        if (storedKeys[id]) {
            setCanDelete(true);
        }
    }, [id]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this post?')) return;

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
                    type: isOp ? 'thread' : 'post',
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

            if (isOp) {
                router.push('/forum');
            } else {
                router.refresh();
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete post');
        } finally {
            setIsDeleting(false);
        }
    };

    // Function to handle greentext
    const formatContent = (text: string) => {
        return text.split('\n').map((line, i) => {
            if (line.trim().startsWith('>')) {
                return <span key={i} className="text-green-500 block">{line}</span>;
            }
            return <span key={i} className="block">{line}</span>;
        });
    };

    return (
        <div className={`p-4 mb-4 rounded-md border ${isOp ? 'border-primary/50 bg-primary/5' : 'border-border bg-card'} overflow-hidden group`}>
            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                <span className="font-bold text-primary">Anonymous</span>
                <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
                <span className="text-xs opacity-50">No. {id.slice(0, 8)}</span>
                {index !== undefined && <span className="ml-auto">#{index + 1}</span>}

                {canDelete && (
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Post"
                    >
                        {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                {imageUrl && (
                    <div className="flex-none">
                        <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="block relative w-48 h-48 bg-muted rounded overflow-hidden hover:opacity-90 transition-opacity">
                            <Image
                                src={imageUrl}
                                alt="Post attachment"
                                fill
                                className="object-cover"
                            />
                        </a>
                    </div>
                )}

                <div className="flex-1 font-mono text-sm md:text-base break-words">
                    {formatContent(content)}
                </div>
            </div>
        </div>
    );
}
