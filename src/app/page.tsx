import { supabase } from "@/lib/supabaseClient";
import TimelineCard from "@/components/TimelineCard";
import { Timeline } from "@/data/timeline";
import ProjectCard from "@/components/ProjectCard";
import type { Project } from "@/data/projects";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import SocialSidebar from "@/components/SocialSidebar";
import EmailSidebar from "@/components/EmailSidebar";
import WorkSection from "@/components/WorkSection";
import EndSection from "@/components/EndSection";
export default async function HomePage() {

  //fetching data from the database   
  const { data: siteContentData, error: siteContentError } = await supabase// fetch bio data
    .from('site_content')
    .select('value')
    .eq('key', 'about_bio')
    .single(); // cuz only expect one row

  if (siteContentError || !siteContentData) {
    return <p className='test-center p-8'>Could not load bio data.</p>
  }

  const siteContent = siteContentData?.value;// get JSON object

  const { data: educationData, error: educationError } = await supabase// fetch education data
    .from('timeline')
    .select('*')
    .eq('category', 'education');

  if (educationError) {
    console.error("Error fetching education data:", educationError)

    return <p className="text-center p-8">Error loading education data.</p>
  }


  const { data: experienceData, error: experienceError } = await supabase// fetch experience data
    .from('timeline')
    .select('*')
    .eq('category', 'experience');

  if (experienceError) {
    console.error("Error fetching experience data:", experienceError)

    return <p className="text-center p-8">Error loading experience data.</p>
  }

  const { data: highlightedProjectsData, error: highlightedProjectsError } = await supabase// fetch highlighted projects
    .from('projects')
    .select('*')
    .eq('isHighlighted', true);

  if (highlightedProjectsError) {
    console.error("Erro fetching highlighed projects:", highlightedProjectsError.message);
  }

  const { data: profilePictureData, error: profilePictureError } = await supabase//fetch profile picture
    .from('site_content')
    .select('value')
    .eq('key', 'profile_picture')
    .single();//cuz only one row

  if (profilePictureError || !profilePictureData) {
    return <p className="test-center p-8">Could not load Profile Picture</p>
  }

  const profileImageUrl =
    typeof profilePictureData.value === "string"
      ? profilePictureData.value
      : profilePictureData.value?.url ?? "/avatar.jpg";


  // Fetch Intro Data
  const { data: introData } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', 'intro')
    .single();

  let intro = {
    name: "Aditya Malik",
    bio: "Software Engineer",
    html_text: "Welcome to my portfolio."
  };

  if (introData?.value) {
    if (typeof introData.value === 'string') {
      try {
        intro = JSON.parse(introData.value);
      } catch (e) {
        console.error("Failed to parse intro JSON", e);
      }
    } else {
      intro = introData.value;
    }
  }

  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-background text-foreground relative scroll-smooth no-scrollbar overscroll-y-none [&::-webkit-scrollbar]:hidden">


      <main className="w-full">
        <SocialSidebar
          github={siteContent?.github || ""}
          linkedin={siteContent?.linkedin || ""}
        />
        <EmailSidebar
          email={siteContent?.email || ""}
        />
        {/* Intro Section */}
        <section className="h-screen w-full snap-start flex flex-col justify-center items-start text-left p-8 md:p-24 pb-20 relative max-w-7xl mx-auto overflow-hidden">
          <span className="text-accent font-mono mb-4 text-lg">Hi, my name is</span>
          <h1 className="text-6xl md:text-8xl font-bold text-foreground mb-4">
            {intro.name}.
          </h1>
          <h2 className="text-4xl md:text-4xl font-bold text-muted-foreground mb-8">
            {intro.bio}.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed">
            {intro.html_text}
          </p>
          <Link
            href="/contact"
            className="px-7 py-3 border border-accent text-accent rounded hover:bg-accent/10 transition-colors font-mono"
          >
            Get In Touch
          </Link>

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
              <div className="text-lg md:text-xl leading-relaxed text-muted-foreground space-y-4">
                <p>{siteContent ? siteContent.text : 'Loading bio....'}</p>
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
              <div className="absolute top-5 left-5 w-64 h-64 md:w-80 md:h-80 border-2 border-accent rounded z-0 group-hover:top-3 group-hover:left-3 transition-all duration-300"></div>
            </div>
          </div>
        </section>

        {/* Continuous Scroll Work Section */}
        <WorkSection
          experienceData={experienceData}
          educationData={educationData}
          highlightedProjectsData={highlightedProjectsData}
        />

        {/* End Section */}
        <EndSection />
      </main>
    </div>
  );
}