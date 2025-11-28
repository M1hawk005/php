import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "@/components/ui/card"

import Link from "next/link";
import type { Timeline } from "@/data/timeline";

type TimelineCardProps = {
    timeline: Timeline;
    position?: "left" | "right";
}

export default function TimelineCard({ timeline, position = "left" }: TimelineCardProps) {
    const isLeft = position === "left";

    return (
        <div className="relative group">
            <Card className="flex flex-col h-full relative overflow-hidden bg-[#000000] backdrop-blur-md border border-accent/50 hover:border-accent transition-all duration-500 group-hover:scale-[1.02] transform-gpu">
                <CardHeader className="relative z-10">
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent group-hover:from-accent group-hover:to-primary transition-all duration-300">{timeline.title}</CardTitle>
                    {timeline.institution ? (
                        <CardDescription className="text-muted-foreground mt-2 flex items-center gap-2">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/50"></span>
                            {`${timeline.institution.name}, ${timeline.institution.location}`}
                        </CardDescription>
                    ) : null}
                </CardHeader>

                <CardContent className="flex-1 overflow-auto relative z-10">
                    <p className="text-foreground/90 leading-relaxed">{timeline.description ?? ''}</p>
                </CardContent>

                <CardFooter className="mt-auto flex justify-between items-center border-t border-border/30 pt-4 relative z-10 bg-card/50 backdrop-blur-sm">
                    {timeline.duration ? (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                            <p className="text-sm text-primary font-mono font-medium">{timeline.duration}</p>
                        </div>
                    ) : null}
                    {timeline.marksheetUrl ? (
                        <Link
                            href={timeline.marksheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-secondary hover:text-accent transition-all duration-300 font-medium hover:underline underline-offset-4 flex items-center gap-1 group/link"
                        >
                            Scorecard
                            <svg className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    ) : null}
                </CardFooter>
            </Card>
        </div>
    )
}