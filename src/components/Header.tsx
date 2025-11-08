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

export default function Header({resumeUrl}: HeaderProps){
    const [isVisible, setIsVisible] = useState(true); //Header visibility
    const [isLocked, setIsLocked] = useState(false); //Lock state
    const [hasScrolled, setHasScrolled] = useState(false); //Track first scroll

    useEffect(() => {
        const handleScroll = () => {
            if (isLocked) return; //Don't hide if locked
            if (!hasScrolled && window.scrollY > 0){
                setHasScrolled(true);
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return() => window.removeEventListener('scroll', handleScroll);
    }, [hasScrolled, isLocked]);

    const handleHeaderClick = () => {
        setIsLocked(true); //Lock on click
        setIsVisible(true); 
    }

    return(
        <>   
        {!isVisible && (
            <div
                className="fixed left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
                onMouseEnter={() => setIsVisible(true)}//unhide on hover
            ><div className="w-2 h-8 bg-white opacity-50"></div>    
            </div>
        )}
        <header 
            className={cn(
                "fixed top-0 left-0 right-0 z-10 p-4 bg-gray-100 border-b transition-transform duration-100",
                isVisible? "translate-y-0":"-translate-y-full" //slide up and down
            )}
            onClick={handleHeaderClick}//Lock on click
        >
            <NavigationMenu className="container mx-auto flex justify-between">
                <NavigationMenuLink asChild>
                    <Link href="/" className="text-gray-900 font-bold">
                        mihawk.org
                    </Link>
                </NavigationMenuLink>
                    
                <NavigationMenuList className="flex space-x-4">
                    <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                            <Link href="/projects" className={navigationMenuTriggerStyle()}>Projects</Link>
                        </NavigationMenuLink> 
                    </NavigationMenuItem>
                        <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                            <Link href="/forum" className={navigationMenuTriggerStyle()}>Forum</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                            <Link href="/contact" className={navigationMenuTriggerStyle()}>Contact</Link>
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
                                    "bg-primary text-primary-foreground"
                                )}
                            >
                                Resume
                            </a>
                        ): null }
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </header>
        </>
    );
}