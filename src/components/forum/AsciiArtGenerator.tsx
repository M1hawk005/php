'use client';

import { useState, useRef, useEffect } from 'react';
import { ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

interface AsciiArtGeneratorProps {
    onAsciiGenerated: (asciiImageUrl: string) => void;
}

export default function AsciiArtGenerator({ onAsciiGenerated }: AsciiArtGeneratorProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [asciiImage, setAsciiImage] = useState<string>('');
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImageSrc(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const generateAscii = () => {
        if (!imageSrc || !canvasRef.current) return;

        const img = new window.Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = canvasRef.current!;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;

            // Target resolution for characters
            const charWidth = 6;
            const charHeight = 10;
            const resolution = 100; // Fixed width in characters

            // Correct aspect ratio considering character dimensions
            const aspect = img.height / img.width;
            const width = resolution;
            const height = Math.floor(width * aspect * (charWidth / charHeight));

            // Setup a temporary canvas to downscale the image
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d')!;
            tempCtx.drawImage(img, 0, 0, width, height);
            
            const imageData = tempCtx.getImageData(0, 0, width, height);
            const data = imageData.data;

            // Setup the final rendering canvas
            canvas.width = width * charWidth;
            canvas.height = height * charHeight;

            // Fill background with a dark color for contrast
            ctx.fillStyle = '#09090b'; // Tailwind zinc-950
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // ASCII character set for luma mapping (reversed for dark background)
            const ASCII_CHARS = "@%#+?*;=-:.` ".split("").reverse();

            ctx.font = 'bold 10px monospace';
            ctx.textBaseline = 'top';

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = (y * width + x) * 4;
                    const r = data[idx];
                    const g = data[idx + 1];
                    const b = data[idx + 2];
                    const a = data[idx + 3];

                    if (a > 0) {
                        const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                        const charIndex = Math.round(luma * (ASCII_CHARS.length - 1));
                        const char = ASCII_CHARS[charIndex];

                        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                        ctx.fillText(char, x * charWidth, y * charHeight);
                    }
                }
            }
            
            setAsciiImage(canvas.toDataURL('image/png', 0.9));
        };
        img.src = imageSrc;
    };

    useEffect(() => {
        if (imageSrc) {
            generateAscii();
        }
    }, [imageSrc]);

    const handleApply = () => {
        if (asciiImage) {
            onAsciiGenerated(asciiImage);
            setImageSrc(null);
            setAsciiImage('');
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="w-full">
            <canvas ref={canvasRef} className="hidden" />
            
            {!imageSrc ? (
                <div>
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden" 
                        id="ascii-upload"
                    />
                    <label 
                        htmlFor="ascii-upload"
                        className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-md hover:border-primary hover:text-primary transition-colors cursor-pointer text-sm w-fit"
                    >
                        <ImageIcon size={16} />
                        Convert Image to ASCII
                    </label>
                </div>
            ) : (
                <div className="space-y-4 border border-border p-4 rounded-md bg-muted/20">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-sm">ASCII Image Generator</h4>
                        <button 
                            type="button"
                            onClick={() => { setImageSrc(null); setAsciiImage(''); }}
                            className="text-muted-foreground hover:text-red-500"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {asciiImage && (
                        <div className="bg-background border border-border p-2 rounded overflow-hidden flex justify-center">
                            <Image 
                                src={asciiImage} 
                                alt="ASCII Preview" 
                                width={500} 
                                height={500} 
                                className="object-contain max-h-64"
                            />
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleApply}
                        className="w-full bg-primary text-primary-foreground py-2 rounded-md text-sm font-bold hover:opacity-90 transition-opacity"
                    >
                        Attach ASCII Image
                    </button>
                </div>
            )}
        </div>
    );
}
