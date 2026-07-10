'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createThread } from '@/actions/forum';
import AsciiArtGenerator from './AsciiArtGenerator';

export default function CreateThreadForm() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [asciiImage, setAsciiImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
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
            formData.append('title', title);
            formData.append('content', content);
            formData.append('secretKey', secretKey);
            
            if (asciiImage) {
                formData.append('imageUrl', asciiImage);
            }

            const result = await createThread(formData);

            if (result.error) throw new Error(result.error);
            const threadData = result.thread;

            // Save secret key to localStorage for deletion capabilities
            if (threadData) {
                const storedKeys = JSON.parse(localStorage.getItem('php_forum_keys') || '{}');
                storedKeys[threadData.id] = secretKey;
                localStorage.setItem('php_forum_keys', JSON.stringify(storedKeys));
            }

            setTitle('');
            setContent('');
            setAsciiImage(null);
            setIsOpen(false);
        } catch (err: unknown) {
            console.error('Error creating thread:', err);
            setError(err instanceof Error ? err.message : 'Failed to create thread');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full p-4 border border-dashed border-border rounded-md text-muted-foreground hover:text-primary hover:border-primary transition-colors text-center"
            >
                + Start a New Thread
            </button>
        );
    }

    return (
        <div className="bg-card border border-border rounded-md p-6 mb-8 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-foreground">New Thread</h3>
                <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X size={20} />
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="text"
                        placeholder="Subject (Optional)"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-background border border-border rounded p-3 focus:border-primary focus:outline-none transition-colors"
                    />
                </div>

                <div>
                    <textarea
                        placeholder="Content (Markdown allowed). Embedded image links will be rendered."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={6}
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
                        Post Thread
                    </button>
                </div>
            </form>
        </div>
    );
}
