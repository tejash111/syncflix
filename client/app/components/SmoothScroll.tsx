"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentY = useRef(0);
  const targetY = useRef(0);
  const ease = 0.075; // Lower = smoother but slower
  const [isMobile, setIsMobile] = useState(true); // Default to mobile to prevent flash

  useEffect(() => {
    // Check if device supports smooth scroll (desktop only)
    const checkMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                        window.innerWidth < 1024;
    setIsMobile(checkMobile);
    
    if (checkMobile) return;

    const container = containerRef.current;
    const scroll = scrollRef.current;
    if (!container || !scroll) return;

    // Set body height to enable native scroll
    const setBodyHeight = () => {
      document.body.style.height = `${scroll.getBoundingClientRect().height}px`;
    };

    // Smooth scroll animation
    const smoothScroll = () => {
      targetY.current = window.scrollY;
      currentY.current += (targetY.current - currentY.current) * ease;
      
      // Round to prevent subpixel rendering issues
      const roundedY = Math.round(currentY.current * 100) / 100;
      
      scroll.style.transform = `translate3d(0, ${-roundedY}px, 0)`;
      
      requestAnimationFrame(smoothScroll);
    };

    // Initialize
    setBodyHeight();
    window.addEventListener("resize", setBodyHeight);
    requestAnimationFrame(smoothScroll);

    // Observe content height changes
    const resizeObserver = new ResizeObserver(setBodyHeight);
    resizeObserver.observe(scroll);

    return () => {
      window.removeEventListener("resize", setBodyHeight);
      resizeObserver.disconnect();
      document.body.style.height = "";
    };
  }, []);

  // On mobile, render children directly without the fixed container
  if (isMobile) {
    return <>{children}</>;
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 overflow-hidden"
      style={{ willChange: "transform" }}
    >
      <div 
        ref={scrollRef}
        style={{ 
          willChange: "transform",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
