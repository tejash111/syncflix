"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: "10K+", label: "USERS" },
  { value: "∞", label: "ROOMS" },
  { value: "<50ms", label: "LATENCY" },
  { value: "24/7", label: "ONLINE" },
];

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="about" 
      className="relative py-32 px-8 md:px-16 bg-black min-h-screen flex items-center"
    >
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Content */}
          <div>
            {/* Section Label */}
            <span 
              className={`text-label block mb-8 transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              HOW IT WORKS
            </span>

            {/* Main Statement */}
            <h2 
              className={`text-statement mb-6 transition-all duration-700 delay-100 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              WATCH MOVIES TOGETHER WITH FRIENDS, NO MATTER WHERE{" "}
              <span className="text-italic-accent">THEY ARE.</span>
            </h2>

            {/* Description */}
            <div 
              className={`space-y-6 transition-all duration-700 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <p className="text-[15px] leading-relaxed text-[var(--text-secondary)]">
                Create a room, share the code with friends, and load the same video file. SyncFlix keeps everyone perfectly in sync with real-time play, pause, and seek.
              </p>
              <p className="text-[15px] leading-relaxed text-[var(--text-secondary)]">
                No uploads, no buffering, no limits. Your files stay on your device while we handle the synchronization magic.
              </p>
            </div>

            {/* CTA */}
            <div 
              className={`mt-12 transition-all duration-700 delay-300 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <a href="/watch" className="btn-outline inline-flex items-center gap-3 group">
                CREATE A ROOM
                <span className="w-8 h-8 rounded-full border border-current flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <svg 
                    className="w-3 h-3" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </span>
              </a>
            </div>
          </div>

          {/* Right Content - Stats Circle */}
          <div 
            className={`flex justify-center lg:justify-end transition-all duration-1000 delay-300 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
            }`}
          >
            <div className="relative">
              {/* Animated ring */}
              <div 
                className="stats-circle relative"
                style={{
                  animation: isVisible ? "pulse-ring 3s ease-out infinite" : "none",
                }}
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-8">
                  {stats.map((stat, index) => (
                    <div 
                      key={stat.label}
                      className={`text-center transition-all duration-700 ${
                        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                      }`}
                      style={{ transitionDelay: `${400 + index * 100}ms` }}
                    >
                      <div className="stat-value">{stat.value}</div>
                      <div className="stat-label">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative outer ring */}
              <div 
                className="absolute inset-[-20px] border border-white/5 rounded-full pointer-events-none"
                style={{
                  animation: isVisible ? "spin 60s linear infinite" : "none",
                }}
              />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div 
          className={`flex justify-center mt-24 transition-all duration-700 delay-500 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <button 
            onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            className="scroll-indicator"
          >
            <span className="scroll-indicator-dot" />
          </button>
        </div>
      </div>

      {/* Background subtle gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-0 right-0 w-1/2 h-full opacity-30"
          style={{
            background: "radial-gradient(ellipse at 70% 30%, rgba(255,255,255,0.02) 0%, transparent 60%)",
          }}
        />
      </div>
    </section>
  );
}
