'use client';

import { useId, useRef, useState } from 'react';
import { ImageIcon, Loader2 } from 'lucide-react';

export default function AsciiArtGenerator({ onAsciiGenerated }: { onAsciiGenerated: (value: string) => void }) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function convert(file: File) {
    if (!file.type.startsWith('image/') || file.size > 8_000_000) {
      setError('Choose an image smaller than 8 MB.');
      return;
    }
    setBusy(true);
    setError(null);
    const source = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      try {
        const charWidth = 6;
        const charHeight = 10;
        const width = 72;
        const height = Math.max(1, Math.floor(width * (image.height / image.width) * (charWidth / charHeight)));
        const sampling = document.createElement('canvas');
        sampling.width = width;
        sampling.height = height;
        const sampleContext = sampling.getContext('2d', { willReadFrequently: true });
        if (!sampleContext) throw new Error('Canvas unavailable');
        sampleContext.drawImage(image, 0, 0, width, height);
        const pixels = sampleContext.getImageData(0, 0, width, height).data;

        const output = document.createElement('canvas');
        output.width = width * charWidth;
        output.height = height * charHeight;
        const context = output.getContext('2d');
        if (!context) throw new Error('Canvas unavailable');
        context.fillStyle = '#09090b';
        context.fillRect(0, 0, output.width, output.height);
        context.font = 'bold 10px monospace';
        context.textBaseline = 'top';
        const characters = ' .:-=;*?+#%@';

        for (let y = 0; y < height; y += 1) {
          for (let x = 0; x < width; x += 1) {
            const offset = (y * width + x) * 4;
            const r = pixels[offset];
            const g = pixels[offset + 1];
            const b = pixels[offset + 2];
            const alpha = pixels[offset + 3];
            if (alpha === 0) continue;
            const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            const character = characters[Math.round(luma * (characters.length - 1))];
            context.fillStyle = `rgb(${r}, ${g}, ${b})`;
            context.fillText(character, x * charWidth, y * charHeight);
          }
        }

        onAsciiGenerated(output.toDataURL('image/webp', 0.82));
        if (inputRef.current) inputRef.current.value = '';
      } catch {
        setError('This image could not be converted.');
      } finally {
        URL.revokeObjectURL(source);
        setBusy(false);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(source);
      setBusy(false);
      setError('This image could not be read.');
    };
    image.src = source;
  }

  return (
    <div className="space-y-2">
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) convert(file);
        }}
      />
      <label htmlFor={inputId} className="flex w-fit cursor-pointer items-center gap-2 border border-border bg-background px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
        {busy ? 'Converting and attaching…' : 'Convert and attach image as ASCII'}
      </label>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
