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

import { ChevronDown, ChevronUp } from "lucide-react";

import { usePathname } from "next/navigation";

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

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={toggleHeader}
                className="fixed top-0 left-4 z-50 p-2 bg-transparent backdrop-blur-none border-b border-x border-border/50 hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label={isVisible ? "Collapse Header" : "Expand Header"}
            >
                {isVisible ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>

            <header
                className={cn(
                    "fixed top-0 left-0 right-0 z-40 p-4 bg-background/70 backdrop-blur-md border-b border-border transition-transform duration-300 ease-in-out",
                    isVisible ? "translate-y-0" : "-translate-y-full" //slide up and down
                )}
            >
                <div className="w-full flex justify-between items-center px-4">
                    <Link
                        href="/"
                        className={cn(
                            "font-bold text-xl tracking-wider ml-12 transition-colors hover:text-primary",
                            pathname === "/" ? "text-primary" : "text-foreground"
                        )}
                    >
                        HOME
                    </Link>

                    <NavigationMenu>
                        <NavigationMenuList className="flex space-x-4">
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link
                                        href="/projects"
                                        className={cn(
                                            navigationMenuTriggerStyle(),
                                            "transition-colors hover:bg-primary hover:text-primary-foreground",
                                            pathname === "/projects" ? "bg-primary text-primary-foreground" : "bg-transparent"
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
                                            "transition-colors hover:bg-secondary hover:text-secondary-foreground",
                                            pathname === "/forum" ? "bg-secondary text-secondary-foreground" : "bg-transparent"
                                        )}
                                    >
                                        Forum
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink asChild>
                                    <Link
                                        href="/contact"
                                        className={cn(
                                            navigationMenuTriggerStyle(),
                                            "transition-colors hover:bg-accent hover:text-accent-foreground",
                                            pathname === "/contact" ? "bg-accent text-accent-foreground" : "bg-transparent"
                                        )}
                                    >
                                        Contact
                                    </Link>
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
                                            "bg-primary text-primary-foreground hover:bg-primary/90"
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