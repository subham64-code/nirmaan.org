"use client";

import { useState } from "react";
import { Play, User, MapPin, Calendar, Award } from "lucide-react";

interface Faculty {
  id: string;
  name: string;
  expertise: string;
  video: string;
  bio: string;
  experience: string;
  achievements: string[];
  image: string;
  website?: string;
}

const facultyMembers: Faculty[] = [
  {
    id: "krishan",
    name: "Krishan Kumar",
    expertise: "Soft Skills Trainer",
    video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    bio: "Expert in communication skills and personality development with 10+ years of experience in corporate training.",
    experience: "10+ Years",
    achievements: ["Trained 5000+ Professionals", "Corporate Training Expert", "Communication Specialist"],
    image: "/trainer-krishan.jpg"
  },
  {
    id: "stithikantha",
    name: "Stithikantha Mohanty",
    expertise: "Soft Skills Trainer",
    video: "https://www.youtube.com/embed/jNQXAC9IVRw",
    bio: "Specialized in behavioral training and leadership development, helping students build confidence and professional skills.",
    experience: "8+ Years",
    achievements: ["Leadership Coach", "Team Building Expert", "HR Consultant"],
    image: "/trainer-stithikantha.jpg"
  },
  {
    id: "mihir",
    name: "Mihir Pattanaik",
    expertise: "AI Master Trainer",
    video: "https://www.youtube.com/embed/aircAruvnKk",
    bio: "AI expert with deep knowledge in machine learning, deep learning, and practical AI implementations.",
    experience: "12+ Years",
    achievements: ["AI Research Published", "ML Projects Delivered", "Tech Speaker"],
    image: "/trainer-mihir.png"
  },
  {
    id: "kalpa",
    name: "Kalpa Pandit",
    expertise: "AI Master Trainer",
    video: "https://www.youtube.com/embed/IHZwWFhwv5E",
    bio: "Seasoned AI professional specializing in NLP, computer vision, and cutting-edge AI technologies.",
    experience: "15+ Years",
    achievements: ["NLP Expert", "Computer Vision Specialist", "AI Consultant"],
    image: "/trainer-kalpa.jpg"
  },
  {
    id: "placement",
    name: "Placement Coordinator",
    expertise: "Placement & Career Development",
    video: "https://www.youtube.com/embed/ukzFI9rgwfU",
    bio: "Dedicated to student success with expertise in resume building, interview preparation, and industry connections.",
    experience: "7+ Years",
    achievements: ["1000+ Placements", "Career Coach", "Industry Connect"],
    image: "/trainer-placement.jpg"
  }
];

export default function FacultyIntroVideos() {
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);

  return (
    <div className="section">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl mb-4">Meet Our Expert Faculty</h1>
        <p className="max-w-3xl mx-auto text-lg text-[var(--muted)] leading-relaxed">
          Learn from industry experts with decades of combined experience in AI, machine learning, 
          and professional development. Our faculty brings real-world knowledge and practical insights 
          to help you succeed in your career journey.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {facultyMembers.map((faculty, index) => (
          <div
            key={faculty.id}
            className="glass p-6 rounded-2xl hover:shadow-xl transition-all duration-300 cursor-pointer group"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => setSelectedFaculty(faculty)}
          >
            {/* Faculty Image with Play Button */}
            <div className="relative mb-4 rounded-xl overflow-hidden bg-[var(--surface-2)] group-hover:scale-105 transition-transform">
              <img
                src={faculty.image}
                alt={faculty.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=${faculty.name}`;
                }}
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                <Play className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Faculty Information */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-[var(--foreground)]">{faculty.name}</h3>
                <span className="px-3 py-1 bg-[var(--brand)] text-white text-sm rounded-full font-medium">
                  {faculty.expertise}
                </span>
              </div>
              
              <p className="text-[var(--muted)] leading-relaxed">{faculty.bio}</p>
              
              <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{faculty.experience} Experience</span>
                </div>
              </div>

              {/* Achievements */}
              <div className="mt-4">
                <h4 className="font-semibold text-[var(--foreground)] mb-2">Key Achievements:</h4>
                <div className="flex flex-wrap gap-2">
                  {faculty.achievements.map((achievement, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs rounded-full text-[var(--muted)]"
                    >
                      {achievement}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Faculty Details Modal */}
      {selectedFaculty && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedFaculty(null)}
        >
          <div 
            className="glass p-8 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedFaculty.name}</h2>
                <p className="text-[var(--brand)]">{selectedFaculty.expertise}</p>
              </div>
              <button
                onClick={() => setSelectedFaculty(null)}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                X
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-3">Introduction Video</h3>
                <div className="relative rounded-xl overflow-hidden bg-[var(--surface-2)]">
                  <iframe
                    className="w-full h-64"
                    src={selectedFaculty.video}
                    title={`${selectedFaculty.name} - Introduction`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Professional Profile</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Experience:</span>
                    <span className="text-[var(--muted)]">{selectedFaculty.experience}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium">Bio:</span>
                    <p className="text-[var(--muted)] mt-1">{selectedFaculty.bio}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium">Achievements:</span>
                    <ul className="mt-2 space-y-1">
                      {selectedFaculty.achievements.map((achievement, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-[var(--brand)]" />
                          <span className="text-[var(--muted)]">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>
  );
}
