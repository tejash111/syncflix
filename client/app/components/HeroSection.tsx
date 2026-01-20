"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Removed scrollToWork - now using Link to /watch

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex items-center justify-center overflow-hidden"
      id="hero"
    >
      {/* Background Video/Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s]"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1920&q=80')`,
            transform: `scale(1.1) translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`,
            filter: "brightness(0.6) contrast(1.1)",
          }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
      </div>

      {/* Animated grain overlay */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Main Content */}
      <div className="relative z-20 text-center px-4">
        {/* WATCH text */}
        <div className="overflow-hidden">
          <h1 
            className="hero-title animate-slide-up"
            style={{ 
              textShadow: "0 4px 60px rgba(255,255,255,0.1)",
            }}
          >
            WATCH
          </h1>
        </div>
        
        {/* TOGETHER outline text */}
        <div className="overflow-hidden">
          <h2 
            className="text-outline animate-slide-up delay-200"
            style={{ marginTop: "-0.1em" }}
          >
            TOGETHER
          </h2>
        </div>

        {/* Start Watch Party Button */}
        <div className="mt-12 flex justify-center">
          <Link
            href="/watch"
            className="scroll-indicator animate-fade-in delay-600 hover:scale-110 transition-all duration-300 group flex items-center justify-center"
            style={{ width: "80px", height: "80px" }}
          >
            <span className="text-[10px] tracking-[0.2em] font-medium text-white/70 group-hover:text-white transition-colors">START</span>
          </Link>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-12 left-0 right-0 z-20 px-8 md:px-16">
        <div className="flex justify-center">
          <div className="animate-fade-in delay-700">
            <span className="text-label">SYNC MOVIES WITH FRIENDS IN REAL-TIME</span>
          </div>
        </div>
      </div>

      {/* Scroll text */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-fade-in delay-800">
        <span className="text-label text-[10px] tracking-[0.3em]">SCROLL</span>
      </div>

      {/* Side indicator */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20 hidden lg:flex flex-col items-center gap-4">
        <Link 
          href="/watch"
          className="scroll-indicator animate-fade-in delay-500 flex items-center justify-center"
          style={{ width: "48px", height: "48px" }}
        >
          <span className="text-[8px] tracking-[0.15em] text-white/50">GO</span>
        </Link>
      </div>
    </section>
  );
}
