import { getHomeContent, getProjects } from "@/lib/markdown";

import { ChevronDown } from "lucide-react";
import SocialSidebar from "@/components/SocialSidebar";
import EmailSidebar from "@/components/EmailSidebar";
import WorkSection from "@/components/WorkSection";
import EndSection from "@/components/EndSection";
import ReactMarkdown from 'react-markdown';

export default async function HomePage() {
  const content = getHomeContent();
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


  const intro = {
    name: "Aditya Malik",
    bio: "Software Engineer",
    html_text: content.intro || "Welcome to my portfolio."
  };

  return (
    <div className="h-[100svh] w-full overflow-y-scroll snap-y snap-mandatory bg-background text-foreground relative scroll-smooth no-scrollbar overscroll-y-none [&::-webkit-scrollbar]:hidden motion-reduce:scroll-auto">
      <main className="w-full">
        <SocialSidebar
          github="https://github.com/M1hawk005"
          linkedin="http://www.linkedin.com/in/aditya-m-920aa020a"
        />
        <EmailSidebar
          email="aditya.malik32x@gmail.com"
        />
        {/* Intro Section */}
        <section className="h-[100svh] w-full snap-start flex flex-col justify-center items-start text-left px-6 md:px-24 pt-[80px] md:pt-[106px] pb-6 md:pb-8 relative max-w-7xl mx-auto overflow-hidden">
          <div className="flex-1 flex flex-col justify-center w-full">
            <span className="text-muted-foreground font-mono mb-2 md:mb-4 text-sm md:text-lg">Hi, my name is</span>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-foreground mb-2 md:mb-4">
              {intro.name}.
            </h1>
            <h2 className="text-2xl sm:text-4xl md:text-4xl font-bold text-muted-foreground mb-4 md:mb-8">
              {intro.bio}.
            </h2>
            <div className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mb-6 md:mb-12 leading-relaxed prose prose-invert">
              <p className="m-0">
                Software Engineer based in Melbourne. Specializing in AI/ML and building robust scientific software systems.
              </p>
            </div>
            <div>
              <a
                href="mailto:aditya.malik32x@gmail.com"
                className="px-7 py-3 min-h-[44px] flex items-center justify-center w-fit border border-border text-foreground rounded hover:border-accent hover:text-accent hover:bg-accent/10 transition-colors font-mono"
              >
                Get In Touch
              </a>
            </div>
          </div>

          <div className="flex-none flex justify-center w-full mt-5 pb-4 md:pb-8">
            <ChevronDown className="text-muted-foreground w-8 h-8 animate-bounce motion-reduce:animate-none" />
          </div>
        </section>

        {/* About Section */}
        <section className="h-[100svh] w-full snap-start flex items-center justify-center p-8 md:p-24 pb-20 relative overflow-hidden">
          <div className="max-w-3xl w-full mx-auto flex flex-col justify-center">
            {/* Text Content */}
            <div className="text-left space-y-8 md:border-l md:border-border/50 md:pl-8">
              <h2 className="text-sm md:text-base font-mono text-accent uppercase tracking-wider">
                About
              </h2>
              <div className="text-lg md:text-xl leading-relaxed text-muted-foreground space-y-6 prose prose-invert max-w-none">
                <ReactMarkdown>{content.bio || 'Loading bio....'}</ReactMarkdown>
              </div>
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
