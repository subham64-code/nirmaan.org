"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, X, Image as ImageIcon, Video as VideoIcon, Download, Share2 } from "lucide-react";

const galleryImages = [
  "/gallery-inauguration.png",
  "/gallery-students.jpg",
  "/gallery-office.jpg",
  "/gallery-youth.jpg",
  "/gallery-labour.jpg",
  "/gallery-activity.png",
  "/gallery-event-1.jpg",
  "/gallery-event-2.jpg",
  "/gallery-event-3.jpg",
  "/gallery-event-4.jpg",
  "/gallery-event-5.jpg",
  "/gallery-event-6.jpg",
  "/gallery-event-7.jpg",
  "/gallery-event-8.jpg",
  "/gallery-event-9.jpg",
  "/gallery-event-10.jpg",
];

const attendanceVideos = [
  {
    title: "About Us",
    src: "/attendance-media/about-us-background.mp4",
    thumbnail: "/gallery-inauguration.png"
  },
  {
    title: "Location Demo",
    src: "/attendance-media/location-demo.mp4",
    thumbnail: "/gallery-students.jpg"
  },
  {
    title: "Smart Lab",
    src: "/attendance-media/smart-lab-background.mp4",
    thumbnail: "/gallery-activity.png"
  }
];

export default function MediaGallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "photos" | "videos">("all");

  const handleImageClick = (src: string) => {
    setSelectedImage(src);
  };

  const handleVideoClick = (src: string) => {
    setSelectedVideo(src);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setSelectedVideo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-bold mb-4">Media Gallery</h1>
            <p className="text-xl opacity-90">
              Explore our collection of photos and videos showcasing events, activities, and facilities
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              filter === "all"
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("photos")}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              filter === "photos"
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            Photos
          </button>
          <button
            onClick={() => setFilter("videos")}
            className={`px-6 py-3 rounded-full font-semibold transition-all ${
              filter === "videos"
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            Videos
          </button>
        </div>

        {/* Photos Section */}
        {(filter === "all" || filter === "photos") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
              <ImageIcon className="w-8 h-8 text-indigo-600" />
              Photo Gallery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((image, index) => (
                <motion.div
                  key={image}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all"
                  onClick={() => handleImageClick(image)}
                >
                  <img
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                      <span className="text-white font-semibold">
                        {image.split('/').pop()?.split('.')[0]?.replace(/-/g, ' ')}
                      </span>
                      <div className="flex gap-2">
                        <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
                          <Download className="w-5 h-5 text-white" />
                        </button>
                        <button className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
                          <Share2 className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Videos Section */}
        {(filter === "all" || filter === "videos") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
              <VideoIcon className="w-8 h-8 text-indigo-600" />
              Video Gallery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attendanceVideos.map((video, index) => (
                <motion.div
                  key={video.src}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all"
                  onClick={() => handleVideoClick(video.src)}
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-indigo-600 ml-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-white font-semibold text-lg">{video.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
            onClick={closeLightbox}
          >
            <X className="w-8 h-8 text-white" />
          </button>
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            src={selectedImage}
            alt="Selected image"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Video Lightbox */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
            onClick={closeLightbox}
          >
            <X className="w-8 h-8 text-white" />
          </button>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={selectedVideo}
              controls
              autoPlay
              className="w-full rounded-lg"
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
