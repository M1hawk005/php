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
    timeline: Timeline
}

export default function TimelineCard({ timeline }: TimelineCardProps) {
    return (
        <Card className="flex flex-col h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group">
            <CardHeader>
                <CardTitle className="text-xl text-primary group-hover:text-accent transition-colors">{timeline.title}</CardTitle>
                {timeline.institution ? (
                    <CardDescription className="text-muted-foreground">{`${timeline.institution.name}, ${timeline.institution.location}`}</CardDescription>
                ) : <p>describe</p>}
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
                <p className="text-foreground/80 leading-relaxed">{timeline.description ?? ''}</p>
            </CardContent>
            <CardFooter className="mt-auto flex justify-between items-center border-t border-border/30 pt-4">
                {timeline.duration ? (
                    <p className="text-sm text-muted-foreground font-mono">{timeline.duration}</p>
                ) : null}
                {timeline.marksheetUrl ? (
                    <Link href={timeline.marksheetUrl} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-accent hover:underline transition-colors">
                        Scorecard
                    </Link>
                ) : null}
            </CardFooter>
        </Card>
    )
}