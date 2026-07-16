"use client";

import { useEffect, useRef, useState } from "react";
import TimelineCard from "./TimelineCard";
import ProjectCard from "./ProjectCard";
import type { Timeline } from "@/data/timeline";
import type { Project } from "@/data/projects";
import { cn } from "@/lib/utils";

interface WorkSectionProps {
    experienceData: Timeline[] | null;
    educationData: Timeline[] | null;
    highlightedProjectsData: Project[] | null;
}

type SectionType = "Experience" | "Education" | "Featured Projects" | null;

const timelineFlowStyles = `
@keyframes timeline-flow-down {
    0% {
        opacity: 0;
        transform: translateY(-100%) scaleY(0.55);
    }
    18% {
        opacity: 1;
    }
    68% {
        opacity: 0.95;
    }
    100% {
        opacity: 0;
        transform: translateY(300%) scaleY(1.15);
    }
}

.timeline-flow-down {
    animation: timeline-flow-down 2.4s cubic-bezier(0.45, 0, 0.55, 1) infinite;
    filter: drop-shadow(0 0 5px currentColor);
}

@media (prefers-reduced-motion: reduce) {
    .timeline-flow-down {
        animation: none;
        opacity: 0.75;
        transform: translateY(100%);
    }
}
`;

type TimelineListProps = {
    entries: Timeline[] | null;
    emptyMessage: string;
};

function TimelineRail({ section, itemCount }: { section: SectionType; itemCount: number }) {
    const accent = section === "Education" ? "via-secondary" : "via-primary";
    const visible = (section === "Experience" || section === "Education") && itemCount > 0;
    const railHeight = `${Math.max(itemCount - 1, 0) * 8}rem`;

    return (
        <>
            <style>{timelineFlowStyles}</style>
            <div
                aria-hidden="true"
                data-timeline-rail={section?.toLowerCase() || "hidden"}
                className={`pointer-events-none absolute left-1/2 top-0 z-0 hidden w-px -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-border/70 transition-[height,opacity] duration-500 md:block ${visible ? "opacity-100" : "opacity-0"}`}
                style={{ height: railHeight }}
            >
                <span
                    key={section}
                    className={`timeline-flow-down absolute left-0 top-0 h-1/3 w-full bg-gradient-to-b from-transparent ${accent} to-transparent`}
                />
            </div>
        </>
    );
}

function TimelineNode({ position }: { position: "left" | "right" }) {
    return (
        <>
            <span
                aria-hidden="true"
                className={`absolute top-1/2 z-20 hidden h-px w-5 -translate-y-1/2 bg-border md:block ${position === "left" ? "-right-5" : "-left-5"}`}
            />
            <span
                aria-hidden="true"
                data-timeline-node
                className={`absolute top-1/2 z-20 hidden size-3 -translate-y-1/2 rounded-full border-2 border-primary bg-background shadow-[0_0_12px_color-mix(in_oklab,var(--primary)_55%,transparent)] md:block ${position === "left" ? "-right-[26px]" : "-left-[26px]"}`}
            />
        </>
    );
}

function TimelineList({ entries, emptyMessage }: TimelineListProps) {
    const sortedEntries = entries ? [...entries].sort((a, b) => b.order - a.order) : [];

    return (
        <div className="relative mx-auto flex h-full w-full max-w-5xl flex-col justify-center">
            {sortedEntries.length > 0 ? (
                <div className="relative w-full">
                    <div className="relative z-10 w-full space-y-4">
                        {sortedEntries.map((entry, index) => {
                            const position = index % 2 === 0 ? "left" : "right";

                            return (
                                <div
                                    key={entry.id}
                                    className={`relative md:w-[calc(50%-20px)] ${position === "left" ? "md:mr-auto" : "md:ml-auto"}`}
                                >
                                    <TimelineNode position={position} />
                                    <TimelineCard timeline={entry} position={position} compact />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <p className="text-center text-muted-foreground">{emptyMessage}</p>
            )}
        </div>
    );
}

export default function WorkSection({
    experienceData,
    educationData,
    highlightedProjectsData,
}: WorkSectionProps) {
    const [activeSection, setActiveSection] = useState<SectionType>("Experience");

    const experienceRef = useRef<HTMLDivElement>(null);
    const educationRef = useRef<HTMLDivElement>(null);
    const projectsRef = useRef<HTMLDivElement>(null);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!scrollRef.current) return;

        const observer = new IntersectionObserver((entries) => {
            const getSectionName = (target: Element): SectionType => {
                if (target === experienceRef.current) return "Experience";
                if (target === educationRef.current) return "Education";
                if (target === projectsRef.current) return "Featured Projects";
                return null;
            };

            const getSectionOrder = (name: SectionType) => {
                if (name === "Experience") return 1;
                if (name === "Education") return 2;
                if (name === "Featured Projects") return 3;
                return 0;
            };

            const validEntries = entries.filter(e => e.isIntersecting && getSectionName(e.target) !== null);
            if (validEntries.length === 0) return;

            validEntries.sort((a, b) => {
                if (b.intersectionRatio !== a.intersectionRatio) {
                    return b.intersectionRatio - a.intersectionRatio;
                }
                const nameA = getSectionName(a.target);
                const nameB = getSectionName(b.target);
                return getSectionOrder(nameA) - getSectionOrder(nameB);
            });

            const bestSection = getSectionName(validEntries[0].target);
            if (bestSection) {
                setActiveSection(bestSection);
            }
        }, {
            root: scrollRef.current,
            rootMargin: "0px",
            threshold: 0.5,
        });

        if (experienceRef.current) observer.observe(experienceRef.current);
        if (educationRef.current) observer.observe(educationRef.current);
        if (projectsRef.current) observer.observe(projectsRef.current);

        return () => {
            observer.disconnect();
        };
    }, []);

    const getHeaderColor = () => {
        if (activeSection === "Experience") return "text-primary";
        if (activeSection === "Education") return "text-secondary";
        if (activeSection === "Featured Projects") return "text-accent";
        return "text-foreground";
    };
    const timelineRailCount = activeSection === "Experience"
        ? experienceData?.length || 0
        : activeSection === "Education"
            ? educationData?.length || 0
            : 0;

    return (
        <section className="h-[100svh] w-full snap-start flex flex-col relative bg-background">
            {/* Pinned Shared Header */}
            <div className={cn(
                "flex-none pt-22 md:pt-26 pb-2 md:pb-4 z-20 transition-all duration-300",
                !activeSection ? "opacity-0 pointer-events-none" : "opacity-100"
            )}>
                <h2 className={cn("text-3xl md:text-4xl font-bold text-center transition-colors duration-500", getHeaderColor())}>
                    {activeSection || "Work"}
                </h2>
            </div>

            {/* Inner Snap Scroller */}
            <div className="relative min-h-0 flex-1">
                <div
                    ref={scrollRef}
                    tabIndex={0}
                    role="region"
                    aria-label="Experience, education, and featured projects"
                    className="h-full overflow-y-auto no-scrollbar scroll-smooth motion-reduce:scroll-auto snap-y snap-mandatory relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <div className="pointer-events-none sticky top-1/2 z-0 h-0 w-full">
                        <TimelineRail section={activeSection} itemCount={timelineRailCount} />
                    </div>
                {/* Experience Stage */}
                <div ref={experienceRef} className="h-full w-full shrink-0 snap-start flex flex-col px-4 md:px-8 pb-4">
                    <TimelineList
                        entries={experienceData}
                        emptyMessage="No experience data found."
                    />
                </div>

                {/* Education Stage */}
                <div ref={educationRef} className="h-full w-full shrink-0 snap-start flex flex-col px-4 md:px-8 pb-4">
                    <TimelineList
                        entries={educationData}
                        emptyMessage="No education data found."
                    />
                </div>

                {/* Projects Stage */}
                <div ref={projectsRef} className="h-full w-full shrink-0 snap-start flex flex-col px-4 md:px-8 pb-4">
                    <div className="w-full max-w-5xl mx-auto h-full flex flex-col relative justify-center">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {highlightedProjectsData && highlightedProjectsData.length > 0 ? (
                                highlightedProjectsData.map((project: Project) => (
                                    <div key={project.id} className="h-full">
                                        <ProjectCard project={project} compact />
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground col-span-full">No projects found.</p>
                            )}
                        </div>
                    </div>
                </div>
                </div>
            </div>
        </section>
    );
}
