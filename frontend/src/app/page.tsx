import Link from "next/link";
import { Bot, BrainCircuit, BriefcaseBusiness, Sparkles, MapPin, BookOpen, FileText, Images, ClipboardCheck, UserCheck } from "lucide-react";
import Image from "next/image";
import { adminProfile, courses, galleryImages, trainerProfiles, backgroundVideoUrl } from "@/lib/constants";
import { AchievementsSection } from "@/components/AchievementsSection";
import { CombinedLogo } from "@/components/LogoSection";
import GIFTHubs from "@/components/GIFTHubs";
// import FacultyIntroVideos from "@/components/FacultyIntroVideos";

export default function Home() {
  return (
    <div>
      <section className="relative min-h-[88vh] overflow-hidden border-b border-[var(--outline)] bg-[var(--surface)]">
        {/* YouTube Background Video */}
        <div className="absolute inset-0 z-0">
          <iframe
            className="w-full h-full"
            src={backgroundVideoUrl}
            title="Background Video"
            frameBorder="0"
            allow="clipboard-write; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-[var(--surface)]/80 to-[var(--surface)]" />
        </div>
        
        <div className="section relative flex min-h-[88vh] flex-col items-start justify-center gap-8 z-10">
          <span className="rounded-full border border-[var(--outline)] px-4 py-1 text-xs uppercase tracking-widest">Future-ready education ecosystem</span>
          <h1 data-reveal className="max-w-4xl text-4xl leading-tight md:text-7xl">
            Learn AI.<br />Build career momentum.<br />Get placement ready.
          </h1>
          <p data-reveal className="max-w-2xl text-base text-[var(--muted)] md:text-lg">
            Nirmaan delivers AI/ML, Deep Learning, NLP, Generative AI and Soft Skills programs with structured attendance, testing, progress tracking and placement support.
          </p>
          <div data-reveal className="flex flex-wrap gap-3">
            <Link href="/apply" className="rounded-full bg-[var(--brand)] px-6 py-3 font-semibold text-white hover:opacity-90 transition-opacity">Apply Now</Link>
            <Link href="/courses" className="rounded-full border border-[var(--outline)] px-6 py-3 font-semibold hover:bg-[var(--surface-2)] transition-colors">Explore Courses</Link>
            <Link href="/syllabus" className="rounded-full border border-[var(--outline)] px-6 py-3 font-semibold hover:bg-[var(--surface-2)] transition-colors">📋 View Syllabus</Link>
            <a href="/notes" target="_blank" rel="noopener noreferrer" className="rounded-full border border-[var(--outline)] px-6 py-3 font-semibold hover:bg-[var(--surface-2)] transition-colors">📄 View Notes</a>
            <Link href="/media" className="rounded-full border border-[var(--outline)] px-6 py-3 font-semibold hover:bg-[var(--surface-2)] transition-colors flex items-center gap-2">
              <Images className="w-5 h-5" />
              Media Gallery
            </Link>
            <Link href="/exam" className="rounded-full border border-[var(--outline)] px-6 py-3 font-semibold hover:bg-[var(--surface-2)] transition-colors flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5" />
              Exam System
            </Link>
            <Link href="/attendance-system" className="rounded-full border border-[var(--outline)] px-6 py-3 font-semibold hover:bg-[var(--surface-2)] transition-colors flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Attendance System
            </Link>
          </div>
        </div>
      </section>

      {/* GIFT Hubs Section - Temporarily disabled due to syntax errors */}
      {/* <GIFTHubs /> */}

      {/* Faculty Intro Videos Section - Temporarily disabled due to syntax errors */}
      {/* <FacultyIntroVideos /> */}

      <section className="section grid gap-6 md:grid-cols-4">
        {[
          { icon: <Bot />, title: "Generative AI", text: "Build LLM apps with practical capstones." },
          { icon: <BrainCircuit />, title: "Deep Learning", text: "Hands-on CV, NLP and transformer workflows." },
          { icon: <Sparkles />, title: "Soft Skills", text: "Interview communication and confidence labs." },
          { icon: <BriefcaseBusiness />, title: "Placement Support", text: "Resume, mock interview and hiring pipeline." },
        ].map((item) => (
          <article key={item.title} data-reveal className="glass p-6">
            <div className="mb-4 inline-flex rounded-xl bg-[var(--surface-2)] p-3 text-[var(--brand)]">{item.icon}</div>
            <h3 className="text-xl">{item.title}</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="section">
        <h2 data-reveal className="text-3xl md:text-5xl">Programs Built For Outcomes</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <article key={course.title} data-reveal className="glass p-6">
              <div className="mb-3 text-xs uppercase tracking-wider text-[var(--brand)]">{course.duration}</div>
              <h3 className="text-2xl">{course.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{course.description}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider">Placement</p>
              <p className="text-sm text-[var(--muted)]">{course.placement}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 data-reveal className="text-3xl md:text-5xl">Meet The Trainers</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {trainerProfiles.map((trainer) => (
            <article key={trainer.name} data-reveal className="glass overflow-hidden">
              <Image src={trainer.image} alt={trainer.name} width={600} height={360} className="h-56 w-full object-cover" />
              <div className="p-5">
                <h3 className="text-xl">{trainer.name}</h3>
                <p className="text-sm text-[var(--muted)]">{trainer.expertise}</p>
                <a className="mt-3 inline-block text-sm text-[var(--brand)]" href={trainer.video} target="_blank" rel="noreferrer">Watch intro</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 data-reveal className="text-3xl md:text-5xl">Nirmaan Inauguration Event</h2>
        <p data-reveal className="mt-4 max-w-2xl text-lg text-[var(--muted)]">
          Watch the official inauguration ceremony of Nirmaan AI Training Center and glimpse the vision that drives our mission.
        </p>
        <div data-reveal className="mt-8 glass overflow-hidden rounded-2xl">
          <div className="relative w-full pt-[56.25%]">
            <iframe
              className="absolute inset-0 w-full h-full border-0"
              src="https://www.youtube.com/embed/-TO3mgStyZY?autoplay=0&controls=1"
              title="Nirmaan Inauguration Ceremony"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <section className="section">
        <h2 data-reveal className="text-3xl md:text-5xl">Administration</h2>
        <article data-reveal className="glass mt-8 grid gap-5 p-5 md:grid-cols-[220px_1fr]">
          <Image src={adminProfile.image} alt={adminProfile.name} width={220} height={220} className="h-56 w-full rounded-2xl object-cover" />
          <div>
            <h3 className="text-3xl">{adminProfile.name}</h3>
            <p className="mt-1 text-[var(--brand)]">{adminProfile.role}</p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Central admin operations are managed through secure OTP access, student approval workflows, attendance and assessment oversight, and placement-oriented analytics.
            </p>
          </div>
        </article>
      </section>

      <section className="section">
        <h2 data-reveal className="text-3xl md:text-5xl">Inauguration Gallery</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {galleryImages.map((img, i) => (
            <div key={`${img}-${i}`} data-reveal className="relative h-36 overflow-hidden rounded-2xl border border-[var(--outline)] md:h-48">
              <Image src={img} alt={`Gallery ${i + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      <AchievementsSection />

      <section className="section text-center py-12 px-4">
        <CombinedLogo />
        <p className="mt-6 text-sm text-[var(--muted)]">
          © 2024 Nirmaan Educational Initiative. All rights reserved.<br/>
          Building tomorrow's AI professionals, today.
        </p>
      </section>
    </div>
  );
}
