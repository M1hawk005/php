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
    compact?: boolean;
}

const isNullish = (val: string | null | undefined): boolean => {
    if (!val) return true;
    const trimmed = val.trim().toLowerCase();
    return trimmed === 'null' || trimmed === 'undefined';
};

export default function TimelineCard({ timeline, compact }: TimelineCardProps) {
    return (
        <div className="relative group h-full">
            {/* Glow effect */}
            {!compact && (
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl opacity-0 group-hover:opacity-100 transition duration-500 blur-sm"></div>
            )}

            <Card className={`flex flex-col h-full relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/40 hover:border-primary/30 transition-all duration-500 ${compact ? 'p-0' : 'group-hover:translate-y-[-2px]'} `}>
                <CardHeader className="relative z-10 pb-2">
                    <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1.5">
                            {!isNullish(timeline.title) && (
                                <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                                    {timeline.title}
                                </CardTitle>
                            )}
                            {timeline.institution && (!isNullish(timeline.institution.name) || !isNullish(timeline.institution.location)) ? (
                                <CardDescription className={`text-muted-foreground flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-border"></span>
                                    {[timeline.institution.name, timeline.institution.location]
                                        .filter(val => !isNullish(val))
                                        .join(', ')}
                                </CardDescription>
                            ) : null}
                        </div>

                        {!isNullish(timeline.duration) ? (
                            <div className={`shrink-0 px-3 py-1 rounded-full bg-muted/50 border border-border font-mono font-medium text-muted-foreground ${compact ? 'text-[10px]' : 'text-xs'}`}>
                                {timeline.duration}
                            </div>
                        ) : null}
                    </div>
                </CardHeader>

                <CardContent className={`flex-1 relative z-10 py-2 ${compact ? 'text-xs' : 'text-sm'}`}>
                    <p className={`text-muted-foreground/90 leading-relaxed ${compact ? 'line-clamp-2' : ''}`}>
                        {!isNullish(timeline.description) ? timeline.description : ''}
                    </p>
                </CardContent>

                {!isNullish(timeline.marksheetUrl) && (
                    <CardFooter className={`mt-auto relative z-10 ${compact ? 'pt-2 pb-4' : 'pt-4 pb-6'}`}>
                        <Link
                            href={timeline.marksheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 group/link bg-muted/50 px-3 py-1.5 rounded-md hover:bg-primary/10"
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
