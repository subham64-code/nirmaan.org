import type { Metadata } from "next";
import { Space_Grotesk, Sora } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";
import ToastProvider from "@/components/ToastProvider";
import PageIntro from "@/components/PageIntro";
import GsapEffects from "@/components/GsapEffects";
import ErrorBoundary from "@/components/ErrorBoundary";
import AIChatWidget from "@/components/AIChatWidget";
import SiteBackgroundVideo from "@/components/SiteBackgroundVideo";

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "nirmaan.org | AI & Career Training Ecosystem",
  description: "Nirmaan educational platform for AI/ML, DL, NLP, GenAI and Soft Skills with placement support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sora.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="relative isolate min-h-full flex flex-col bg-[var(--bg)] text-[var(--text)]">
        <SiteBackgroundVideo />
        <ThemeProvider>
          <ToastProvider>
            <ErrorBoundary>
              <div className="relative z-10 flex min-h-screen flex-1 flex-col">
                <PageIntro />
                <GsapEffects />
                <Navbar />
                <main className="flex-1">
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                </main>
                <Footer />
                <AIChatWidget />
              </div>
            </ErrorBoundary>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
