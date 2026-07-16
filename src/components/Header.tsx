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

import { ChevronDown, ChevronUp, FileText, Home, Mail, Menu, X } from "lucide-react";

import { usePathname } from "next/navigation";

// Force rebuild to fix hydration mismatch
export default function Header({ resumeUrl }: HeaderProps) {
    const [isVisible, setIsVisible] = useState(true); //Header visibility
    const [hasScrolled, setHasScrolled] = useState(false); //Track first scroll
    const [mobileOpen, setMobileOpen] = useState(false);
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
            <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-lg md:hidden">
                <div className="flex h-16 items-center justify-between px-4">
                    <Link href="/" aria-current={pathname === '/' ? 'page' : undefined} className="flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 font-mono font-bold transition-colors hover:bg-primary/10" aria-label="Home">
                        <Home size={20} className={pathname === "/" ? "fill-primary/30 text-primary" : ""} />
                    </Link>
                    <button type="button" onClick={() => setMobileOpen((open) => !open)} className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary" aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={mobileOpen} aria-controls="mobile-navigation">
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
                {mobileOpen && (
                    <nav id="mobile-navigation" className="border-t border-border bg-background px-4 py-3 shadow-xl" aria-label="Mobile navigation">
                        <div className="grid gap-1">
                            <Link href="/blog" onClick={() => setMobileOpen(false)} aria-current={pathname.startsWith("/blog") ? "page" : undefined} className={cn("flex min-h-12 items-center rounded-md px-4 font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary", pathname.startsWith("/blog") && "bg-primary/10 text-primary")}>Blog</Link>
                            <Link href="/projects" onClick={() => setMobileOpen(false)} aria-current={pathname.startsWith("/projects") ? "page" : undefined} className={cn("flex min-h-12 items-center rounded-md px-4 font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary", pathname.startsWith("/projects") && "bg-primary/10 text-primary")}>Projects</Link>
                            <Link href="/forum" onClick={() => setMobileOpen(false)} aria-current={pathname.startsWith("/forum") ? "page" : undefined} className={cn("flex min-h-12 items-center rounded-md px-4 font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary", pathname.startsWith("/forum") && "bg-primary/10 text-primary")}>Forum</Link>
                            <a href="mailto:aditya.malik32x@gmail.com" onClick={() => setMobileOpen(false)} className="flex min-h-12 items-center rounded-md px-4 font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"><Mail size={18} className="mr-3" /> Email</a>
                            {resumeUrl && <a href={resumeUrl} target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)} className="flex min-h-12 items-center rounded-md px-4 font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary"><FileText size={18} className="mr-3" /> Resume</a>}
                        </div>
                    </nav>
                )}
            </header>

            {/* Toggle Button */}
            <button
                onClick={toggleHeader}
                className="fixed top-6 left-6 z-50 hidden p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 md:block"
                aria-label={isVisible ? "Collapse Header" : "Expand Header"}
            >
                {isVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-40 hidden h-20 items-center px-4 bg-background/80 backdrop-blur-lg border-b transition-all duration-300 ease-in-out md:flex",
                    getBorderColor(),
                    isVisible ? "translate-y-0" : "-translate-y-full" //slide up and down
                )}
            >
                <div className="w-full flex justify-between items-center px-4">
                    <Link
                        href="/"
                        aria-current={pathname === '/' ? 'page' : undefined}
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
                                        aria-current={pathname.startsWith("/blog") ? "page" : undefined}
                                        className={cn(
                                            navigationMenuTriggerStyle(),
                                            "w-24 justify-center transition-colors hover:!bg-primary/10 hover:!text-primary focus:!bg-primary/10 focus:!text-primary",
                                            pathname.startsWith("/blog") ? "!bg-primary/10 !text-primary" : "bg-transparent"
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
                                        aria-current={pathname.startsWith("/projects") ? "page" : undefined}
                                        className={cn(
                                            navigationMenuTriggerStyle(),
                                            "w-24 justify-center transition-colors hover:!bg-primary/10 hover:!text-primary focus:!bg-primary/10 focus:!text-primary",
                                            pathname.startsWith("/projects") ? "!bg-primary/10 !text-primary" : "bg-transparent"
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
                                        aria-current={pathname.startsWith("/forum") ? "page" : undefined}
                                        className={cn(
                                            navigationMenuTriggerStyle(),
                                            "w-24 justify-center transition-colors hover:!bg-primary/10 hover:!text-primary focus:!bg-primary/10 focus:!text-primary",
                                            pathname.startsWith("/forum") ? "!bg-primary/10 !text-primary" : "bg-transparent"
                                        )}
                                    >
                                        Forum
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <a
                                        href="mailto:aditya.malik32x@gmail.com"
                                        className={cn(
                                            navigationMenuTriggerStyle(),
                                            "transition-colors hover:!bg-primary/10 hover:!text-primary focus:!bg-primary/10 focus:!text-primary group px-3"
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
