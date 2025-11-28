import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";

interface ThreadCardProps {
    id: string;
    title?: string | null;
    content: string;
    imageUrl?: string | null;
    createdAt: string;
    replyCount: number;
}

export default function ThreadCard({ id, title, content, imageUrl, createdAt, replyCount }: ThreadCardProps) {
    return (
        <Link href={`/forum/${id}`} className="block group">
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
                        <div className="text-xs text-muted-foreground mb-2">
                            Anonymous • {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
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
                    <span className="group-hover:text-primary transition-colors">View Thread &rarr;</span>
                </div>
            </div>
        </Link>
    );
}
