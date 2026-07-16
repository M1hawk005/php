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

    const getHeaderColor = () => "text-foreground";

    return (
        <section className="h-[100svh] w-full snap-start flex flex-col relative bg-background">
            {/* Pinned Shared Header */}
            <div className={cn(
                "flex-none pt-20 md:pt-24 pb-2 md:pb-4 z-20 transition-all duration-300",
                !activeSection ? "opacity-0 pointer-events-none" : "opacity-100"
            )}>
                <h2 className={cn("text-3xl md:text-4xl font-bold text-center transition-colors duration-500", getHeaderColor())}>
                    {activeSection || "Work"}
                </h2>
            </div>

            {/* Inner Snap Scroller */}
            <div
                ref={scrollRef}
                tabIndex={0}
                role="region"
                aria-label="Experience, education, and featured projects"
                className="flex-1 overflow-y-auto no-scrollbar scroll-smooth motion-reduce:scroll-auto snap-y snap-mandatory relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
                {/* Experience Stage */}
                <div ref={experienceRef} className="h-full w-full shrink-0 snap-start flex flex-col px-4 md:px-8 pb-4">
                    <div className="w-full max-w-5xl mx-auto h-full flex flex-col relative justify-center">
                        <div className="w-full space-y-4">
                            {experienceData && experienceData.length > 0 ? (
                                [...experienceData]
                                    .sort((a, b) => b.order - a.order)
                                    .map((experience: Timeline, index: number) => {
                                        const position = index % 2 === 0 ? "left" : "right";
                                        return (
                                            <div key={experience.id} className={`relative md:w-[calc(50%-20px)] ${position === "left" ? "md:mr-auto" : "md:ml-auto"}`}>
                                                <TimelineCard timeline={experience} position={position} compact />
                                            </div>
                                        );
                                    })
                            ) : (
                                <p className="text-center text-muted-foreground">No experience data found.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Education Stage */}
                <div ref={educationRef} className="h-full w-full shrink-0 snap-start flex flex-col px-4 md:px-8 pb-4">
                    <div className="w-full max-w-5xl mx-auto h-full flex flex-col relative justify-center">
                        <div className="w-full space-y-4">
                            {educationData && educationData.length > 0 ? (
                                [...educationData]
                                    .sort((a, b) => b.order - a.order)
                                    .map((education: Timeline, index: number) => {
                                        const position = index % 2 === 0 ? "left" : "right";
                                        return (
                                            <div key={education.id} className={`relative md:w-[calc(50%-20px)] ${position === "left" ? "md:mr-auto" : "md:ml-auto"}`}>
                                                <TimelineCard timeline={education} position={position} compact />
                                            </div>
                                        );
                                    })
                            ) : (
                                <p className="text-center text-muted-foreground">No education data found.</p>
                            )}
                        </div>
                    </div>
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
        </section>
    );
}
