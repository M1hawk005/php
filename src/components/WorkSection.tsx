"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
    const endRef = useRef<HTMLDivElement>(null);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const options = {
            root: scrollRef.current,
            rootMargin: "0px",
            threshold: 0.5, // Trigger when 50% of the section is visible
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    if (entry.target === experienceRef.current) {
                        setActiveSection("Experience");
                    } else if (entry.target === educationRef.current) {
                        setActiveSection("Education");
                    } else if (entry.target === projectsRef.current) {
                        setActiveSection("Featured Projects");
                    } else if (entry.target === endRef.current) {
                        setActiveSection(null);
                    }
                }
            });
        }, options);

        if (experienceRef.current) observer.observe(experienceRef.current);
        if (educationRef.current) observer.observe(educationRef.current);
        if (projectsRef.current) observer.observe(projectsRef.current);
        if (endRef.current) observer.observe(endRef.current);

        return () => {
            observer.disconnect();
        };
    }, []);

    // Determine header color based on active section
    const getHeaderColor = () => {
        switch (activeSection) {
            case "Experience": return "text-primary";
            case "Education": return "text-secondary";
            case "Featured Projects": return "text-accent";
            default: return "text-foreground";
        }
    };

    return (
        <div className="h-screen w-full snap-start flex flex-col relative pt-20">
            {/* Sticky Header */}
            <div className={cn(
                "z-20 py-8 bg-background/95 backdrop-blur-md transition-all duration-300 flex-none",
                !activeSection ? "opacity-0 pointer-events-none" : "opacity-100"
            )}>
                <h2
                    className={cn(
                        "text-3xl md:text-4xl font-bold text-center transition-colors duration-500",
                        getHeaderColor()
                    )}
                >
                    {activeSection}
                </h2>
            </div>

            {/* Scrollable Content */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar scroll-smooth snap-y snap-mandatory scroll-pt-0">
                <div className="flex flex-col h-full">
                    {/* Experience Section */}
                    <div ref={experienceRef} className="min-h-full w-full snap-start flex flex-col p-8 md:p-24 pt-4">
                        <div className="w-full max-w-5xl mx-auto h-full flex flex-col relative">
                            {/* Central Timeline Line */}
                            <div className="absolute left-1/2 top-0 bottom-24 w-0.5 bg-gradient-to-b from-primary/50 via-border/30 to-transparent -translate-x-1/2 hidden md:block"></div>

                            <div className="w-full space-y-12 flex-1 pb-24">
                                {experienceData && experienceData.length > 0 ? (
                                    [...experienceData]
                                        .sort((a, b) => b.order - a.order)
                                        .map((experience: Timeline, index: number) => {
                                            const position = index % 2 === 0 ? "left" : "right";
                                            return (
                                                <div key={experience.id} className={`relative md:w-[calc(50%-30px)] ${position === "left" ? "md:mr-auto" : "md:ml-auto"
                                                    }`}>
                                                    <TimelineCard timeline={experience} position={position} />
                                                </div>
                                            );
                                        })
                                ) : (
                                    <p className="text-center text-muted-foreground">No experience data found.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Education Section */}
                    <div ref={educationRef} className="min-h-full w-full snap-start flex flex-col p-8 md:p-24 pt-4">
                        <div className="w-full max-w-5xl mx-auto h-full flex flex-col relative">
                            {/* Central Timeline Line */}
                            <div className="absolute left-1/2 top-0 bottom-24 w-0.5 bg-gradient-to-b from-secondary/50 via-border/30 to-transparent -translate-x-1/2 hidden md:block"></div>

                            <div className="w-full space-y-12 flex-1 pb-24">
                                {educationData && educationData.length > 0 ? (
                                    [...educationData]
                                        .sort((a, b) => b.order - a.order)
                                        .map((education: Timeline, index: number) => {
                                            const position = index % 2 === 0 ? "left" : "right";
                                            return (
                                                <div key={education.id} className={`relative md:w-[calc(50%-30px)] ${position === "left" ? "md:mr-auto" : "md:ml-auto"
                                                    }`}>
                                                    <TimelineCard timeline={education} position={position} />
                                                </div>
                                            );
                                        })
                                ) : (
                                    <p className="text-center text-muted-foreground">No education data found.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Projects Section */}
                    <div ref={projectsRef} className="min-h-full w-full snap-start flex flex-col p-8 md:p-24 pt-4">
                        <div className="w-full mx-auto h-full flex flex-col">
                            <div className="w-full space-y-6 flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
                                    {highlightedProjectsData && highlightedProjectsData.length > 0 ? (
                                        highlightedProjectsData.map((project: Project) => (
                                            <div key={project.id} className="h-full">
                                                <ProjectCard project={project} />
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
            </div>
        </div>
    );
}
