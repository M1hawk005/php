import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

export default async function HomePage() {
  //fetching data from the database   
  const { data, error } = await supabase
    .from('site_content')
    .select('value')
    .eq('key','about_bio')
    .single(); // cuz only expect one row
  
  const bioContent = data?.value;//get JSON object

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
            <h1 className="text-4xl font-bold mb-4">About Me</h1>

            <section className="mb-8">
              <p>
                {bioContent ? bioContent.text : 'Loading bio....'}   
              </p> 
            </section>
            <section>
                <h2 className="text-2xl font-semibold mb-2">Education</h2>
                    <p>
                        This where where list education 
                    </p>
            </section>
            <section>
                <h2 className="text-2xl font-semibold mb-2">Projects</h2>
                    <p>
                        This where where list education 
                    </p>
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
