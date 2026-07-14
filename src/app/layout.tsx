import Header from '@/components/Header'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import NextTopLoader from 'nextjs-toploader';

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

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

  const resumeUrl = "/resume.pdf";

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.className} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextTopLoader color="#73daca" showSpinner={false} />
        <Header resumeUrl={resumeUrl} />
        {children}
      </body>
    </html>
  );
}
