import { supabase } from "@/lib/supabaseClient";
import TimelineCard from "@/components/TimelineCard";
import { Timeline } from "@/data/timeline";
import ProjectCard from "@/components/ProjectCard";
import type { Project } from "@/data/projects";
import Image from "next/image";

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

  const { data: highlightedProjectsData, error: highlightedProjectsError} = await supabase// fetch highlighted projects
    .from('projects')
    .select('*')
    .eq('isHighlighted', true);

  if (highlightedProjectsError){
    console.error("Erro fetching highlighed projects:",highlightedProjectsError.message);
  }

  const { data: profilePictureData, error: profilePictureError} = await supabase//fetch profile picture
    .from('site_content')
    .select('value')
    .eq('key','profile_picture')
    .single();//cuz only one row

  if ( profilePictureError || !profilePictureData){
    return <p className="test-center p-8">Could not load Profile Picture</p>
  }

  const profileImageUrl =
  typeof profilePictureData.value === "string"
    ? profilePictureData.value
    : profilePictureData.value?.url ?? "/avatar.jpg";

  
  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black text-white">      
      <main>
        <section className="h-screen snap-start flex flex-col justify-center p-50">
          <div className="w-full md:w-40 flex-shrink-0">
            <Image
              src={profileImageUrl}
              alt="Profile"
              width={40000}
              height={50000}
              className="object-cover rounded-none"
            />
          </div>
          <h1 className="text-4xl font-bold mb-4 space-x-4">About Me</h1>
            <p>
              {siteContent ? siteContent.text : 'Loading bio....'}   
            </p> 
        </section>
        <section className="h-screen snap-start flex flex-col p-25">
          <h2 className="text-2xl font-semibold mb-2">Experience</h2>
          <div className="overflow-auto h-full space-x-4 p-4">
            {experienceData && experienceData.length > 0 ? (
              <div className="grid gap-6"> 
                  {experienceData.map((experience: Timeline ) => (
                    <div key={experience.id} className="flex-shrink-0 snap-start">
                      <TimelineCard timeline={experience} />
                    </div>
                  ))}

              </div>
            ) : null}
          </div>
        </section>
        <section className="h-screen snap-start flex flex-col p-25">
          <h2 className="text-2xl font-semibold mb-2">Education</h2>
          <div className="overflow-auto h-full space-x-4 p-4">
            {educationData && educationData.length > 0 ? (
              <div className="grid gap-6">
                  {educationData.map((education: Timeline ) => (
                    <div key={education.id} className="flex-shrink-0 snap-start">
                    <TimelineCard timeline={education} />
                    </div>
                  ))}
              </div>
            ) : null}
          </div>
        </section>
       <section className="h-screen snap-start flex flex-col p-25">
          <h2 className="text-2xl font-semibold mb-2">Projects</h2>
          <div className="overflow-x-auto h-full space-x-4 p-4">
            {highlightedProjectsData && highlightedProjectsData.length > 0 ? (
              <div className="grid gap-6">
                {highlightedProjectsData.map((project: Project) => (
                  <div key={project.id}>
                    <ProjectCard project={project} />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section> 
      </main>
    </div>
  );
}