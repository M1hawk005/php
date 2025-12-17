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
        <div className="relative group h-full">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-500 blur-sm"></div>

            <Card className="flex flex-col h-full relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/40 hover:border-primary/30 transition-all duration-500 group-hover:translate-y-[-2px]">
                <CardHeader className="relative z-10 pb-2">
                    <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1.5">
                            <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                                {timeline.title}
                            </CardTitle>
                            {timeline.institution ? (
                                <CardDescription className="text-muted-foreground flex items-center gap-2 text-sm">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary/70"></span>
                                    {`${timeline.institution.name}, ${timeline.institution.location}`}
                                </CardDescription>
                            ) : null}
                        </div>

                        {timeline.duration ? (
                            <div className="shrink-0 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-xs font-mono font-medium text-secondary">
                                {timeline.duration}
                            </div>
                        ) : null}
                    </div>
                </CardHeader>

                <CardContent className="flex-1 relative z-10 py-2">
                    <p className="text-muted-foreground/90 text-sm leading-relaxed">
                        {timeline.description ?? ''}
                    </p>
                </CardContent>

                {timeline.marksheetUrl && (
                    <CardFooter className="mt-auto pt-4 pb-6 relative z-10">
                        <Link
                            href={timeline.marksheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 group/link bg-primary/5 px-3 py-1.5 rounded-md hover:bg-primary/10"
                        >
                            View Scorecard
                            <svg className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </CardFooter>
                )}
            </Card>
        </div>
    )
}