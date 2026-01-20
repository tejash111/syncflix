"use client";

import { useRef, useState } from "react";

interface Project {
  id: number;
  title: string;
  category: string;
  thumbnail: string;
  videoUrl?: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: "REAL-TIME SYNC",
    category: "INSTANT · SEAMLESS",
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-friends-with-colored-lights-702-large.mp4",
  },
  {
    id: 2,
    title: "WATCH PARTIES",
    category: "TOGETHER · ANYWHERE",
    thumbnail: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-people-popping-confetti-4003-large.mp4",
  },
  {
    id: 3,
    title: "ANY VIDEO FORMAT",
    category: "MP4 · MKV · AVI",
    thumbnail: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&q=80",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-woman-running-above-the-clouds-at-sunset-60773-large.mp4",
  },
  {
    id: 4,
    title: "PRIVATE ROOMS",
    category: "SECURE · ENCRYPTED",
    thumbnail: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1200&q=80",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4",
  },
];

export default function SelectedWorkSection() {
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});

  const handleMouseEnter = (id: number) => {
    setHoveredProject(id);
    const video = videoRefs.current[id];
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  };

  const handleMouseLeave = (id: number) => {
    setHoveredProject(null);
    const video = videoRefs.current[id];
    if (video) {
      video.pause();
    }
  };

  return (
    <section id="work" className="relative py-32 px-8 md:px-16 bg-black min-h-screen">
      {/* Section Header */}
      <div className="flex justify-between items-start mb-16">
        <div>
          <h2 className="section-title-outline animate-fade-in-up">KEY</h2>
          <h2 className="section-title-outline animate-fade-in-up delay-100">FEATURES</h2>
        </div>
        <div className="text-right hidden md:block">
          <span className="text-label text-[10px]">WHAT WE OFFER</span>
        </div>
      </div>

      {/* Divider */}
      <div className="divider mb-16 animate-fade-in delay-200" />

      {/* Projects Grid */}
      <div className="space-y-24">
        {projects.map((project, index) => (
          <article
            key={project.id}
            className="group relative animate-fade-in-up"
            style={{ animationDelay: `${index * 150}ms` }}
            onMouseEnter={() => handleMouseEnter(project.id)}
            onMouseLeave={() => handleMouseLeave(project.id)}
          >
            {/* Video/Image Container */}
            <div className="video-card relative overflow-hidden">
              {/* Thumbnail */}
              <img
                src={project.thumbnail}
                alt={project.title}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  hoveredProject === project.id ? "opacity-0" : "opacity-100"
                }`}
              />
              
              {/* Video */}
              {project.videoUrl && (
                <video
                  ref={(el) => {
                    videoRefs.current[project.id] = el;
                  }}
                  src={project.videoUrl}
                  muted
                  loop
                  playsInline
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    hoveredProject === project.id ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Project Info */}
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <h3 
                  className="hero-title text-2xl md:text-4xl lg:text-5xl mb-2 transition-transform duration-500 group-hover:translate-x-4"
                  style={{ letterSpacing: "0.08em" }}
                >
                  {project.title}
                </h3>
                <p className="text-label opacity-60 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-4">
                  {project.category}
                </p>
              </div>

              {/* Arrow icon */}
              <div className="absolute top-8 right-8 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110">
                <svg 
                  className="w-5 h-5 text-white transform rotate-45 transition-transform duration-300 group-hover:rotate-90" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* View All Button */}
      <div className="flex justify-center mt-24">
<a href="/watch" className="btn-outline group">
          <span className="flex items-center gap-3">
            START WATCHING
            <svg 
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </a>
      </div>
    </section>
  );
}
