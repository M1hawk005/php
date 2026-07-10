'use client'
import { useState, useEffect } from "react";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { cn } from "@/lib/utils"
import Link from "next/link";

type HeaderProps = {
    resumeUrl: string | null;
}

import { ChevronDown, ChevronUp, Home, Mail } from "lucide-react";

import { usePathname } from "next/navigation";

// Force rebuild to fix hydration mismatch
export default function Header({ resumeUrl }: HeaderProps) {
    const [isVisible, setIsVisible] = useState(true); //Header visibility
    const [hasScrolled, setHasScrolled] = useState(false); //Track first scroll
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            if (!hasScrolled && window.scrollY > 50) { // Threshold of 50px
                setHasScrolled(true);
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasScrolled]);

    const toggleHeader = () => {
        setIsVisible(!isVisible);
    }

    const getBorderColor = () => {
        if (pathname === '/projects') return 'border-border';
        if (pathname === '/forum') return 'border-border';
        if (pathname === '/contact') return 'border-border';
        if (pathname === '/') return 'border-border';
        return 'border-border';
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={toggleHeader}
                className="fixed top-6 left-6 z-50 p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300"
                aria-label={isVisible ? "Collapse Header" : "Expand Header"}
            >
                {isVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-40 h-20 flex items-center px-4 bg-background/80 backdrop-blur-lg border-b transition-all duration-300 ease-in-out",
                    getBorderColor(),
                    isVisible ? "translate-y-0" : "-translate-y-full" //slide up and down
                )}
            >
                <div className="w-full flex justify-between items-center px-4">
                    <Link
                        href="/"
                        className={cn(
                            "ml-16 p-2 transition-all duration-300 rounded-md group",
                            pathname === "/"
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-primary"
                        )}
                        aria-label="Home"
                    >
                        <Home
                            size={24}
                            className={cn(
                                "transition-all duration-300",
                                pathname === "/" ? "fill-primary/30" : "group-hover:fill-primary/30"
                            )}
                        />
                    </Link>

                    <NavigationMenu>
                        <NavigationMenuList className="flex space-x-4">
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link
                                        href="/blog"
                                        className={cn(
                                            navigationMenuTriggerStyle(),
                                            "w-24 justify-center transition-colors hover:!bg-[var(--nav-cyan)] hover:!text-primary-foreground focus:!bg-[var(--nav-cyan)] focus:!text-primary-foreground",
                                            pathname.startsWith("/blog") ? "!bg-[var(--nav-cyan)] !text-primary-foreground" : "bg-transparent"
                                        )}
                                    >
                                        Blog
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link
                                        href="/projects"
                                        className={cn(
                                            navigationMenuTriggerStyle(),
                                            "w-24 justify-center transition-colors hover:!bg-[var(--nav-green)] hover:!text-primary-foreground focus:!bg-[var(--nav-green)] focus:!text-primary-foreground",
                                            pathname.startsWith("/projects") ? "!bg-[var(--nav-green)] !text-primary-foreground" : "bg-transparent"
                                        )}
                                    >
                                        Projects
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link
                                        href="/forum"
                                        className={cn(
                                            navigationMenuTriggerStyle(),
                                            "w-24 justify-center transition-colors hover:!bg-[var(--nav-purple)] hover:!text-primary-foreground focus:!bg-[var(--nav-purple)] focus:!text-primary-foreground",
                                            pathname === "/forum" ? "!bg-[var(--nav-purple)] !text-primary-foreground" : "bg-transparent"
                                        )}
                                    >
                                        Forum
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <a
                                        href="#contact"
                                        className={cn(
                                            navigationMenuTriggerStyle(),
                                            "transition-colors hover:!bg-[var(--nav-cyan)] hover:!text-primary-foreground focus:!bg-[var(--nav-cyan)] focus:!text-primary-foreground group px-3"
                                        )}
                                        aria-label="Contact"
                                    >
                                        <Mail size={18} className="transition-transform group-hover:scale-110" />
                                    </a>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                {resumeUrl ? (
                                    <a
                                        href={resumeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                            navigationMenuTriggerStyle(),
                                            "w-24 justify-center bg-transparent border border-border text-foreground hover:border-primary hover:text-primary hover:bg-primary/10 transition-all duration-300"
                                        )}
                                    >
                                        Resume
                                    </a>
                                ) : null}
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
            </header>
        </>
    );
}