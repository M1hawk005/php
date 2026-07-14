import { getHomeContent, getProjects } from "@/lib/markdown";


import Image from "next/image";
import { ChevronDown } from "lucide-react";
import SocialSidebar from "@/components/SocialSidebar";
import EmailSidebar from "@/components/EmailSidebar";
import WorkSection from "@/components/WorkSection";
import EndSection from "@/components/EndSection";
import ReactMarkdown from 'react-markdown';
import type { Timeline } from '@/data/timeline';

export default async function HomePage() {
  const content = getHomeContent() as { intro?: string; bio?: string; experience?: Timeline[]; education?: Timeline[] };
  const projects = getProjects();

  // Highlighted projects
  const highlightedProjectsData = projects
    .filter(p => p.frontmatter.isHighlighted)
    .map(p => ({
        id: p.slug,
        name: p.frontmatter.title || p.slug,
        description: p.frontmatter.description || p.content.slice(0, 100),
        link: p.frontmatter.link || '',
        githubUrl: p.frontmatter.githubUrl || '',
        techStack: p.frontmatter.techStack || [],
        slug: p.slug
    }))
    .slice(0, 3);

  const profileImageUrl = "/avatar.png"; // Statically served

  const intro = {
    name: "Aditya Malik",
    bio: "Software Engineer",
    html_text: content.intro || "Welcome to my portfolio."
  };

  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-background text-foreground relative scroll-smooth no-scrollbar overscroll-y-none [&::-webkit-scrollbar]:hidden">
      <main className="w-full">
        <SocialSidebar
          github="https://github.com/M1hawk005"
          linkedin="http://www.linkedin.com/in/aditya-m-920aa020a"
        />
        <EmailSidebar
          email="aditya.malik32x@gmail.com"
        />
        {/* Intro Section */}
        <section className="h-screen w-full snap-start flex flex-col justify-center items-start text-left p-8 md:p-24 pb-20 relative max-w-7xl mx-auto overflow-hidden">
          <span className="text-muted-foreground font-mono mb-4 text-lg">Hi, my name is</span>
          <h1 className="text-6xl md:text-8xl font-bold text-foreground mb-4">
            {intro.name}.
          </h1>
          <h2 className="text-4xl md:text-4xl font-bold text-muted-foreground mb-8">
            {intro.bio}.
          </h2>
          <div className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed prose prose-invert">
            <ReactMarkdown>{intro.html_text}</ReactMarkdown>
          </div>
          <a
            href="mailto:aditya.malik32x@gmail.com"
            className="px-7 py-3 border border-border text-foreground rounded hover:border-accent hover:text-accent hover:bg-accent/10 transition-colors font-mono"
          >
            Get In Touch
          </a>

          <div className="absolute bottom-25 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="text-muted-foreground w-8 h-8" />
          </div>
        </section>

        {/* About Section */}
        <section className="h-screen w-full snap-start flex items-center justify-center p-8 md:p-24 pb-20 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-16 max-w-7xl w-full mx-auto">
            {/* Text Content */}
            <div className="flex-1 text-left space-y-8 order-2 md:order-1">
              <h2 className="flex items-center text-3xl md:text-4xl font-bold text-foreground">
                About Me
              </h2>
              <div className="text-lg md:text-xl leading-relaxed text-muted-foreground space-y-4 prose prose-invert">
                <ReactMarkdown>{content.bio || 'Loading bio....'}</ReactMarkdown>
              </div>
            </div>

            {/* Image with Frame */}
            <div className="relative group order-1 md:order-2">
              <div className="relative w-64 h-64 md:w-80 md:h-80 z-10">
                <Image
                  src={profileImageUrl}
                  alt="Profile"
                  fill
                  className="object-cover rounded bg-muted grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>
              {/* Decorative Frame */}
              <div className="absolute top-5 left-5 w-64 h-64 md:w-80 md:h-80 border-2 border-border rounded z-0 group-hover:top-3 group-hover:left-3 group-hover:border-accent transition-all duration-300"></div>
            </div>
          </div>
        </section>

        {/* Continuous Scroll Work Section */}
        <WorkSection
          experienceData={content.experience || []}
          educationData={content.education || []}
          highlightedProjectsData={highlightedProjectsData}
        />

        {/* End Section */}
        <EndSection />
      </main>
    </div>
  );
}
