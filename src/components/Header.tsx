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
    return(
        <header className="p-4 bg-gray-100 border-b">
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
    );
}