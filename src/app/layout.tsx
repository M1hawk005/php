import Header from '@/components/Header'
import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import { supabase } from '@/lib/supabaseClient';
import localFont from 'next/font/local'
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';

const headingFont = localFont({
  src: [
    { path: '../../public/fonts/GohuFontuni14NerdFont-Regular.ttf' },
    { path: '../../public/fonts/3270NerdFontMono-SemiCondensed.ttf' },
  ],
  variable: '--font-heading',
  display: 'swap',
})

const bodyFont = localFont({
  src: '../../public/fonts/HackNerdFontMono-Regular.ttf',
  variable: '--font-body',
  display: 'swap',
})

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Aditya Malik",
  description: "Portfolio and projects of Aditya Malik. Building modern web experiences.",
  openGraph: {
    title: "Aditya Malik",
    description: "Portfolio and projects of Aditya Malik. Building modern web experiences.",
    type: "website",
    locale: "en_US",
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const { data: resumeData, error: resumeError } = await supabase// fetch resume data
    .from('site_content')
    .select('value')
    .eq('key', 'resume')
    .single();//  cuz only one row

  if (resumeError) {
    console.error("Failed to fetch resume", resumeError.message);
  }

  const resumeUrl = resumeData?.value?.url;

  return (
    <html lang="en" className="dark">
      <body
        className={`${bodyFont.className} ${headingFont.variable} antialiased`}
      >
        <NextTopLoader color="#73daca" showSpinner={false} />
        <Header resumeUrl={resumeUrl} />
        {children}
      </body>
    </html>
  );
}
