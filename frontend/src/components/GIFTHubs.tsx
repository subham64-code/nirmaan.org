"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Globe } from "lucide-react";

interface Hub {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  courses: string[];
  image: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const giftHubs: Hub[] = [
  {
    id: "bangalore",
    name: "GIFT Bangalore",
    address: "Electronic City, Bengaluru, Karnataka 560100",
    phone: "+91-80-2844-5000",
    email: "bangalore@gift.edu.in",
    website: "https://gift.edu.in/bangalore",
    courses: ["AI/ML", "Deep Learning", "NLP", "Generative AI"],
    image: "/gift-bangalore.jpg",
    coordinates: { lat: 12.8399, lng: 77.6680 }
  },
  {
    id: "mumbai",
    name: "GIFT Mumbai",
    address: "Bandra Kurla Complex, Mumbai, Maharashtra 400050",
    phone: "+91-22-2654-5000",
    email: "mumbai@gift.edu.in",
    website: "https://gift.edu.in/mumbai",
    courses: ["AI/ML", "Deep Learning", "NLP", "Soft Skills"],
    image: "/gift-mumbai.jpg",
    coordinates: { lat: 19.0760, lng: 72.8777 }
  },
  {
    id: "delhi",
    name: "GIFT Delhi",
    address: "Connaught Place, New Delhi 110001",
    phone: "+91-11-2334-5000",
    email: "delhi@gift.edu.in",
    website: "https://gift.edu.in/delhi",
    courses: ["AI/ML", "Deep Learning", "Generative AI", "Soft Skills"],
    image: "/gift-delhi.jpg",
    coordinates: { lat: 28.6139, lng: 77.2090 }
  },
  {
    id: "hyderabad",
    name: "GIFT Hyderabad",
    address: "HITEC City, Hyderabad, Telangana 500081",
    phone: "+91-40-2344-5000",
    email: "hyderabad@gift.edu.in",
    website: "https://gift.edu.in/hyderabad",
    courses: ["AI/ML", "NLP", "Generative AI", "Soft Skills"],
    image: "/gift-hyderabad.jpg",
    coordinates: { lat: 17.3850, lng: 78.4867 }
  },
  {
    id: "chennai",
    name: "GIFT Chennai",
    address: "T Nagar, Chennai, Tamil Nadu 600017",
    phone: "+91-44-2344-5000",
    email: "chennai@gift.edu.in",
    website: "https://gift.edu.in/chennai",
    courses: ["AI/ML", "Deep Learning", "NLP", "Soft Skills"],
    image: "/gift-chennai.jpg",
    coordinates: { lat: 13.0827, lng: 80.2707 }
  },
  {
    id: "pune",
    name: "GIFT Pune",
    address: "Koregaon Park, Pune, Maharashtra 411016",
    phone: "+91-20-2344-5000",
    email: "pune@gift.edu.in",
    website: "https://gift.edu.in/pune",
    courses: ["AI/ML", "Deep Learning", "NLP", "Soft Skills"],
    image: "/gift-pune.jpg",
    coordinates: { lat: 18.5204, lng: 73.8567 }
  }
];

export default function GIFTHubs() {
  const [selectedHub, setSelectedHub] = useState<Hub | null>(null);

  return (
    <div className="section">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl mb-4">GIFT Training Hubs</h1>
        <p className="text-lg text-[var(--muted)] max-w-3xl mx-auto">
          Located across India's major cities, our GIFT hubs provide world-class AI and technology education with state-of-the-art facilities and expert trainers.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {giftHubs.map((hub) => (
          <div
            key={hub.id}
            className="glass p-6 rounded-2xl hover:scale-105 transition-transform cursor-pointer"
            onClick={() => setSelectedHub(hub)}
          >
            {/* Hub Image */}
            <div className="relative h-48 mb-4 rounded-xl overflow-hidden bg-[var(--surface-2)]">
              <img
                src={hub.image}
                alt={hub.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=${hub.name.split(' ')[1]}`;
                }}
              />
              <div className="absolute top-2 right-2 bg-[var(--brand)] text-white px-2 py-1 rounded-full text-xs font-semibold">
                {hub.courses.length} Courses
              </div>
            </div>

            {/* Hub Information */}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-[var(--foreground)]">{hub.name}</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-[var(--muted)]">
                  <MapPin className="w-4 h-4" />
                  <span>{hub.address}</span>
                </div>
                
                <div className="flex items-center gap-2 text-[var(--muted)]">
                  <Phone className="w-4 h-4" />
                  <span>{hub.phone}</span>
                </div>
                
                <div className="flex items-center gap-2 text-[var(--muted)]">
                  <Mail className="w-4 h-4" />
                  <span>{hub.email}</span>
                </div>
                
                <div className="flex items-center gap-2 text-[var(--muted)]">
                  <Globe className="w-4 h-4" />
                  <a 
                    href={hub.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[var(--brand)] hover:underline"
                  >
                    {hub.website}
                  </a>
                </div>
              </div>

              {/* Courses Offered */}
              <div className="mt-4">
                <p className="text-sm font-semibold text-[var(--foreground)] mb-2">Courses Offered:</p>
                <div className="flex flex-wrap gap-2">
                  {hub.courses.map((course) => (
                    <span
                      key={course}
                      className="px-2 py-1 bg-[var(--surface-2)] text-xs rounded-full text-[var(--muted)]"
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hub Details Modal */}
      {selectedHub && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedHub(null)}
        >
          <div
            className="glass p-8 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">{selectedHub.name}</h2>
              <button
                onClick={() => setSelectedHub(null)}
                className="text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Address:</strong> {selectedHub.address}</p>
                  <p><strong>Phone:</strong> {selectedHub.phone}</p>
                  <p><strong>Email:</strong> {selectedHub.email}</p>
                  <p>
                    <strong>Website:</strong>{" "}
                    <a href={selectedHub.website} target="_blank" rel="noopener noreferrer" className="text-[var(--brand)] hover:underline">
                      {selectedHub.website}
                    </a>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Available Courses</h3>
                <div className="space-y-2">
                  {selectedHub.courses.map((course) => (
                    <div key={course} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[var(--brand)] rounded-full" />
                      <span className="text-sm">{course}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
