'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, X } from 'lucide-react';
import { createReply } from '@/actions/forum';
import AsciiArtGenerator from './AsciiArtGenerator';

interface ReplyFormProps {
    threadId: string;
}

export default function ReplyForm({ threadId }: ReplyFormProps) {
    const [content, setContent] = useState('');
    const [asciiImage, setAsciiImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleAsciiGenerated = (asciiImageUrl: string) => {
        setAsciiImage(asciiImageUrl);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const secretKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

            const formData = new FormData();
            formData.append('threadId', threadId);
            formData.append('content', content);
            formData.append('secretKey', secretKey);

            if (asciiImage) {
                formData.append('imageUrl', asciiImage);
            }

            const result = await createReply(formData);

            if (result.error) throw new Error(result.error);
            const postData = result.post;

            // Save secret key to localStorage
            if (postData) {
                const storedKeys = JSON.parse(localStorage.getItem('php_forum_keys') || '{}');
                storedKeys[postData.id] = secretKey;
                localStorage.setItem('php_forum_keys', JSON.stringify(storedKeys));
            }

            setContent('');
            setAsciiImage(null);
        } catch (err: unknown) {
            console.error('Error creating reply:', err);
            setError(err instanceof Error ? err.message : 'Failed to post reply');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-card border border-border rounded-md p-6 mt-8 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4">Post a Reply</h3>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <textarea
                        placeholder="Comment (Markdown allowed). Embedded image links will be rendered."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={4}
                        className="w-full bg-background border border-border rounded p-3 focus:border-primary focus:outline-none font-mono text-sm transition-colors resize-y"
                    />
                </div>

                <div className="pt-2">
                    {asciiImage ? (
                        <div className="relative inline-block border border-border rounded overflow-hidden">
                            <img src={asciiImage} alt="Attached ASCII Art" className="max-h-32 object-contain" />
                            <button 
                                type="button" 
                                onClick={() => setAsciiImage(null)}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ) : (
                        <AsciiArtGenerator onAsciiGenerated={handleAsciiGenerated} />
                    )}
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-primary text-primary-foreground px-8 py-2 rounded font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                        Reply
                    </button>
                </div>
            </form>
        </div>
    );
}
