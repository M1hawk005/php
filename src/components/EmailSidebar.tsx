import Link from "next/link";

interface EmailSidebarProps {
    email: string;
}

export default function EmailSidebar({ email }: EmailSidebarProps) {
    return (
        <div className="hidden md:flex fixed bottom-0 right-10 flex-col items-center gap-6 z-50">
            {email && (
                <Link
                    href={`mailto:${email}`}
                    className="text-muted-foreground hover:text-accent hover:-translate-y-1 transition-all duration-300 vertical-text tracking-widest text-sm font-mono"
                    style={{ writingMode: 'vertical-rl' }}
                >
                    {email}
                </Link>
            )}
            <div className="w-px h-24 bg-muted-foreground/50"></div>
        </div>
    );
}
