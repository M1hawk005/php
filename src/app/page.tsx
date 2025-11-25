import { supabase } from "@/lib/supabaseClient";
import TimelineCard from "@/components/TimelineCard";
import { Timeline } from "@/data/timeline";
import ProjectCard from "@/components/ProjectCard";
import type { Project } from "@/data/projects";
import Image from "next/image";

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


  return (
    <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-background text-foreground relative scroll-smooth">


      <main className="w-full">
        {/* About Section */}
        <section className="h-screen w-full snap-start flex flex-col md:flex-row items-center justify-center gap-12 p-8 md:p-24 relative">
          <div className="w-64 h-64 md:w-80 md:h-80 flex-shrink-0 relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Image
              src={profileImageUrl}
              alt="Profile"
              width={400}
              height={400}
              className="object-cover rounded-full border-4 border-background relative z-10 w-full h-full"
            />
          </div>
          <div className="max-w-2xl text-center md:text-left space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
              About Me
            </h1>
            <div className="p-6 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl shadow-xl">
              <p className="text-lg md:text-xl leading-relaxed text-muted-foreground">
                {siteContent ? siteContent.text : 'Loading bio....'}
              </p>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section className="h-screen w-full snap-start flex flex-col p-8 md:p-24 pt-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-8 flex-shrink-0">Experience</h2>
          <div className="flex-1 overflow-y-auto pr-4 space-y-6 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
              {experienceData && experienceData.length > 0 ? (
                experienceData.map((experience: Timeline) => (
                  <div key={experience.id} className="h-full">
                    <TimelineCard timeline={experience} />
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground col-span-full">No experience data found.</p>
              )}
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section className="h-screen w-full snap-start flex flex-col p-8 md:p-24 pt-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-secondary mb-8 flex-shrink-0">Education</h2>
          <div className="flex-1 overflow-y-auto pr-4 space-y-6 scrollbar-thin scrollbar-thumb-secondary/20 scrollbar-track-transparent">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
              {educationData && educationData.length > 0 ? (
                educationData.map((education: Timeline) => (
                  <div key={education.id} className="h-full">
                    <TimelineCard timeline={education} />
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground col-span-full">No education data found.</p>
              )}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="h-screen w-full snap-start flex flex-col p-8 md:p-24 pt-24">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-accent mb-8 flex-shrink-0">Highlighted Projects</h2>
          <div className="flex-1 overflow-y-auto pr-4 space-y-6 scrollbar-thin scrollbar-thumb-accent/20 scrollbar-track-transparent">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
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
        </section>
      </main>
    </div>
  );
}