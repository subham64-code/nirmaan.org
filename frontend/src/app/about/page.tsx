"use client";

import Image from "next/image";
import { useState } from "react";
import { adminProfile, trainerProfiles, inaugurationVideos, galleryImages } from "@/lib/constants";
import { Play, Pause, Users, Award, Target, BookOpen, Video } from "lucide-react";
import ImageWithFallback from "@/components/ImageWithFallback";

export default function AboutPage() {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const handleVideoPlay = (videoId: string) => {
    setPlayingVideo(playingVideo === videoId ? null : videoId);
  };

  return (
    <div className="section space-y-10">
      {/* Hero Section */}
      <section data-reveal className="glass p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Target className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              About Nirmaan
            </h1>
            <p className="text-[var(--brand)] mt-2">Transforming Education, Building Careers</p>
          </div>
        </div>
        
        <p className="mt-6 max-w-4xl text-lg text-[var(--muted)] leading-relaxed">
          Nirmaan is a premier education initiative focused on transforming students into job-ready professionals 
          through advanced AI and human-centric learning. Our curriculum blends technical depth with practical execution 
          so learners can excel in real product teams and industry environments.
        </p>
        
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--outline)] p-6 hover:border-[var(--brand)] transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <Target className="w-6 h-6 text-blue-500" />
              <h3 className="text-xl font-semibold">Mission</h3>
            </div>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Democratize high-quality AI and career education for every ambitious learner, 
              making advanced tech education accessible and affordable.
            </p>
          </div>
          
          <div className="rounded-xl border border-[var(--outline)] p-6 hover:border-[var(--brand)] transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-6 h-6 text-purple-500" />
              <h3 className="text-xl font-semibold">Vision</h3>
            </div>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Build a sustainable talent pipeline where education directly maps to employability, 
              creating industry-ready professionals.
            </p>
          </div>
          
          <div className="rounded-xl border border-[var(--outline)] p-6 hover:border-[var(--brand)] transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="w-6 h-6 text-green-500" />
              <h3 className="text-xl font-semibold">Approach</h3>
            </div>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Project-based learning with real-world applications, mentorship, and continuous 
              skill assessment and improvement.
            </p>
          </div>
        </div>
      </section>

      {/* Trainers Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-8 h-8 text-blue-500" />
          <h2 data-reveal className="text-3xl font-bold">Expert Trainers</h2>
        </div>
        
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {trainerProfiles.map((trainer, index) => (
            <article 
              key={trainer.name} 
              data-reveal 
              className="glass p-6 hover:shadow-xl transition-all duration-300 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative mb-4 overflow-hidden rounded-xl">
                <ImageWithFallback
                  src={trainer.image}
                  alt={trainer.name}
                  width={480}
                  height={260}
                  className="h-52 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  fallbackText={trainer.name.charAt(0)}
                  fallbackClassName="w-full h-full object-cover"
                />
              </div>
              
              <h3 className="text-xl font-bold text-[var(--foreground)]">{trainer.name}</h3>
              <p className="text-sm font-medium text-[var(--brand)] mb-2">{trainer.expertise}</p>
              <p className="text-sm text-[var(--muted)] mb-4 leading-relaxed">{trainer.bio}</p>
              
              <div className="relative rounded-xl overflow-hidden bg-gray-100">
                <iframe
                  className="h-44 w-full"
                  src={playingVideo === trainer.name ? trainer.video : `${trainer.video}&autoplay=0`}
                  title={trainer.name}
                  allowFullScreen
                  loading="lazy"
                />
                <button
                  onClick={() => handleVideoPlay(trainer.name)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
                  style={{ display: playingVideo === trainer.name ? 'none' : 'flex' }}
                >
                  <Play className="w-12 h-12 text-white" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Admin Section */}
      <section className="glass p-8" data-reveal>
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-8 h-8 text-purple-500" />
          <h2 className="text-3xl font-bold">Leadership Team</h2>
        </div>
        
        <div className="mt-6 grid gap-6 md:grid-cols-[300px_1fr]">
          <div className="relative overflow-hidden rounded-xl">
            <ImageWithFallback
              src={adminProfile.image}
              alt={adminProfile.name}
              width={300}
              height={300}
              className="h-80 w-full object-cover"
              fallbackText={adminProfile.name.charAt(0)}
              fallbackClassName="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
          
          <div className="flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">{adminProfile.name}</h3>
            <p className="text-lg font-medium text-[var(--brand)] mb-4">{adminProfile.role}</p>
            <p className="text-[var(--muted)] leading-relaxed">{adminProfile.bio}</p>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Administration
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                Quality Control
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Student Success
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Videos Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Video className="w-8 h-8 text-red-500" />
          <h2 data-reveal className="text-3xl font-bold">Inauguration & Events</h2>
        </div>
        
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {inaugurationVideos.map((video, index) => (
            <div 
              key={index} 
              data-reveal 
              className="glass p-4 hover:shadow-xl transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
              <p className="text-sm text-[var(--muted)] mb-4">{video.description}</p>
              <div className="relative rounded-xl overflow-hidden">
                <iframe
                  className="h-64 w-full"
                  src={video.embedUrl}
                  title={video.title}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-8 h-8 text-green-500" />
          <h2 data-reveal className="text-3xl font-bold">Gallery</h2>
        </div>
        
        <div className="mt-6 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {galleryImages.map((image, index) => (
            <div 
              key={index} 
              data-reveal 
              className="relative overflow-hidden rounded-xl group cursor-pointer"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <ImageWithFallback
                src={image}
                alt={`Gallery image ${index + 1}`}
                width={400}
                height={300}
                className="h-48 w-full object-cover group-hover:scale-110 transition-transform duration-300"
                fallbackText={`G${index + 1}`}
                fallbackClassName="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
