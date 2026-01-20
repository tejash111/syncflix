"use client";

import { useEffect, useRef, useState } from "react";

const socialLinks = [
  { name: "INSTAGRAM", href: "https://instagram.com" },
  { name: "TWITTER", href: "https://twitter.com" },
  { name: "LINKEDIN", href: "https://linkedin.com" },
];

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section 
      ref={sectionRef}
      id="contact" 
      className="relative py-32 px-8 md:px-16 bg-black border-t border-white/5"
      onMouseMove={handleMouseMove}
    >
      {/* Subtle spotlight effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.03), transparent 40%)`,
        }}
      />

      <div className="max-w-7xl mx-auto relative">
        {/* Main CTA */}
        <div className="text-center mb-24">
          <h2 
            className={`section-title-outline transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
            style={{ letterSpacing: "0.1em" }}
          >
            LET'S TALK
          </h2>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
          {/* Email */}
          <div 
            className={`transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <a 
              href="mailto:hello@syncflix.app"
              className="text-[14px] text-[var(--text-secondary)] hover:text-white transition-colors duration-300 group"
            >
              <span className="relative">
                hello@syncflix.app
                <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full" />
              </span>
            </a>
          </div>

          {/* Scroll Indicator */}
          <div 
            className={`hidden md:block transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="scroll-indicator hover:border-white transition-colors duration-300"
              aria-label="Scroll to top"
            >
              <span className="scroll-indicator-dot" />
            </button>
          </div>

          {/* Social Links */}
          <div 
            className={`flex gap-8 transition-all duration-700 delay-400 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-label hover:text-white transition-colors duration-300 relative group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p 
            className={`text-[11px] text-[var(--text-tertiary)] tracking-wider transition-all duration-700 delay-500 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            © 2024 SYNCFLIX. ALL RIGHTS RESERVED.
          </p>
          <div 
            className={`flex gap-6 transition-all duration-700 delay-600 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <a href="#" className="text-[11px] text-[var(--text-tertiary)] hover:text-white transition-colors duration-300 tracking-wider">
              PRIVACY
            </a>
            <a href="#" className="text-[11px] text-[var(--text-tertiary)] hover:text-white transition-colors duration-300 tracking-wider">
              TERMS
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
