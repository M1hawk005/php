import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";

interface SocialSidebarProps {
    github: string;
    linkedin: string;
}

export default function SocialSidebar({ github, linkedin }: SocialSidebarProps) {
    return (
        <div className="hidden md:flex fixed bottom-0 left-10 flex-col items-center gap-6 z-50">
            <div className="flex flex-col gap-6">
                {github && (
                    <Link
                        href={github}
                        target="_blank"
                        className="text-muted-foreground hover:text-accent hover:-translate-y-1 transition-all duration-300"
                    >
                        <Github size={20} />
                    </Link>
                )}
                {linkedin && (
                    <Link
                        href={linkedin}
                        target="_blank"
                        className="text-muted-foreground hover:text-accent hover:-translate-y-1 transition-all duration-300"
                    >
                        <Linkedin size={20} />
                    </Link>
                )}
            </div>
            <div className="w-px h-24 bg-muted-foreground/50"></div>
        </div>
    );
}
