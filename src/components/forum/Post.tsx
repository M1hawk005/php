import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface PostProps {
    id: string;
    content: string;
    imageUrl?: string | null;
    createdAt: string;
    isOp?: boolean;
    index?: number;
}

export default function Post({ id, content, imageUrl, createdAt, isOp = false, index }: PostProps) {
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
        <div className={`p-4 mb-4 rounded-md border ${isOp ? 'border-primary/50 bg-primary/5' : 'border-border bg-card'} overflow-hidden`}>
            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                <span className="font-bold text-primary">Anonymous</span>
                <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
                <span className="text-xs opacity-50">No. {id.slice(0, 8)}</span>
                {index !== undefined && <span className="ml-auto">#{index + 1}</span>}
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
