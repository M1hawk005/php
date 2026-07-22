/* eslint-disable @next/next/no-img-element */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownArticle({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h2 className="mb-4 mt-14 border-l-2 border-primary pl-4 text-2xl font-bold text-foreground md:text-3xl">{children}</h2>,
        h2: ({ children }) => <h3 className="mb-3 mt-9 text-xl font-semibold text-secondary md:text-2xl">{children}</h3>,
        h3: ({ children }) => <h4 className="mb-3 mt-8 text-lg font-semibold text-foreground md:text-xl">{children}</h4>,
        p: ({ children }) => <p className="my-5 text-base leading-8 text-foreground/80 md:text-lg">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        em: ({ children }) => <em className="text-foreground/90">{children}</em>,
        blockquote: ({ children }) => (
          <blockquote className="my-8 border-l-4 border-accent bg-accent/5 px-5 py-1 text-foreground shadow-[inset_0_0_30px_color-mix(in_oklab,var(--accent)_6%,transparent)]">
            {children}
          </blockquote>
        ),
        ul: ({ children }) => <ul className="my-6 list-disc space-y-3 pl-7 marker:text-primary">{children}</ul>,
        ol: ({ children }) => <ol className="my-6 list-decimal space-y-3 pl-7 marker:font-mono marker:text-primary">{children}</ol>,
        li: ({ children }) => (
          <li className="pl-2 text-base leading-7 text-foreground/80 marker:text-primary md:text-lg">
            {children}
          </li>
        ),
        hr: () => <hr className="my-12 border-border/70" />,
        a: ({ href = '', children }) => {
          const external = href.startsWith('http');
          return (
            <a
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noopener noreferrer' : undefined}
              className="font-medium text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary"
            >
              {children}
            </a>
          );
        },
        img: ({ src = '', alt = '' }) => (
          <span className="my-10 block overflow-hidden border border-border/70 bg-card shadow-2xl shadow-black/20">
            <img src={src} alt={alt} className="block h-auto w-full" loading="lazy" />
            {alt && <span className="block border-t border-border/60 px-4 py-3 text-center font-mono text-xs text-muted-foreground">{alt}</span>}
          </span>
        ),
        table: ({ children }) => (
          <div className="my-8 overflow-x-auto border border-border/70">
            <table className="w-full min-w-[640px] border-collapse text-left">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-primary/10 text-foreground">{children}</thead>,
        th: ({ children }) => <th className="border-b border-border px-4 py-3 font-mono text-xs uppercase tracking-wider text-primary">{children}</th>,
        td: ({ children }) => <td className="border-b border-border/50 px-4 py-3 align-top text-sm leading-6 text-foreground/75">{children}</td>,
        code: ({ children, className }) => (
          <code className={`${className || ''} rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[0.9em] text-secondary`}>{children}</code>
        ),
        pre: ({ children }) => <pre className="my-8 overflow-x-auto border border-border bg-[#09090b] p-5 text-sm leading-7">{children}</pre>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
