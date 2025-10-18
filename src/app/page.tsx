import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import TimelineCard from "@/components/TimelineCard";
import { Timeline } from "@/data/timeline";
import ProjectCard from "@/components/ProjectCard";
import { Project } from "@/data/projects";

export default async function HomePage() {
  
  //fetching data from the database   
  const { data:siteContentData, error:siteContentError } = await supabase// fetch bio data
    .from('site_content')
    .select('value')
    .eq('key','about_bio')
    .single(); // cuz only expect one row

  if (siteContentError || !siteContentData) {
    return <p className='test-center p-8'>Could not load bio data.</p>
  }
                   
  const siteContent = siteContentData?.value;// get JSON object

  const { data: educationData , error: educationError } = await supabase// fetch education data
  .from('timeline')
  .select('*') 
  .eq('category','education');

  if (educationError){
    console.error("Error fetching education data:", educationError)

    return <p className="text-center p-8">Error loading education data.</p>
  }


  const { data: experienceData , error: experienceError } = await supabase// fetch experience data
  .from('timeline')
  .select('*') 
  .eq('category','experience');

  if (experienceError){
    console.error("Error fetching experience data:", experienceError)

    return <p className="text-center p-8">Error loading experience data.</p>
  }

  const { data: highlightedProjects, error: highlightedProjectsError} = await supabase// fetch highlighted projects
    .from('projects')
    .select('*')
    .eq('isHighlighted', true);

  if (highlightedProjectsError){
    console.error("Erro fetching highlighed projects:",highlightedProjectsError.message);
  }

  
  return (
    <div className="font-sans p-8 pb-20 gap-16 sm:p-20">
      <main className="h-screen overflow-y-scroll snap-y snap-mandatory">
            <section className="h-screen snap-start">
              <h1 className="text-4xl font-bold mb-4">About Me</h1>
                <p>
                  {siteContent ? siteContent.text : 'Loading bio....'}   
                </p> 
            </section>
            <section className="h-screen snap-start">
              <h2 className="text-2xl font-semibold mb-2">Experience</h2>
                {experienceData && experienceData.length > 0 && (
                  <div className="grid gap-6">
                      {experienceData.map((experience: Timeline ) => (
                        <TimelineCard key={experience.id} timeline={experience} />
                      ))}
                  </div>
                )}
            </section>
            <section className="h-screen snap-start">
              <h2 className="text-2xl font-semibold mb-2">Education</h2>
                {educationData && educationData.length > 0 && (
                  <div className="grid gap-6">
                      {educationData.map((education: Timeline ) => (
                        <TimelineCard key={education.id} timeline={education} />
                      ))}
                  </div>
                )}
            </section>
            <section className="h-screen snap-start">
              <h2 className="text-2xl font-semibold mb-2">Projects</h2>
                {highlightedProjects && highlightedProjects.length > 0 && (
                  <div className="grid gap-6">
                      {highlightedProjects.map((project: Project) => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                  </div>
                )}
            </section>
        </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
