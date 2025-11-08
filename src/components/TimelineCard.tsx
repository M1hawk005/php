import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from "@/components/ui/card" 

import Link from "next/link";
import type {Timeline} from "@/data/timeline";

type TimelineCardProps = {
    timeline : Timeline
}

export default function TimelineCard({timeline}: TimelineCardProps){
   return( 
        <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle>{timeline.title}</CardTitle>
                {timeline.institution? (
                    <CardDescription>{`${timeline.institution.name}, ${timeline.institution.location}`}</CardDescription>
                ): <p>describe</p>} 
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
                <p>{timeline.description ?? ''}</p>
            </CardContent>
            <CardFooter className="mt-auto flex justify-between items-center">
                {timeline.duration ? (
                    <p className="text-sm text-muted-foreground">{timeline.duration}</p>
                ):null }
                {timeline.marksheetUrl ? (
                    <Link href={timeline.marksheetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline m-4">
                        Scorecard
                    </Link>
                ): null}
            </CardFooter>
        </Card>
   )
}