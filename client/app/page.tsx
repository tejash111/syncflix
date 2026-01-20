"use client";

import { useState, useRef, useEffect } from "react";
import Navigation from "./components/Navigation";
import HeroSection from "./components/HeroSection";
import SelectedWorkSection from "./components/SelectedWorkSection";
import AboutSection from "./components/AboutSection";
import ContactSection from "./components/ContactSection";
import CustomCursor from "./components/CustomCursor";
import SmoothScroll from "./components/SmoothScroll";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger entrance animations
    setIsLoaded(true);
  }, []);

  return (
    <SmoothScroll>
      <CustomCursor />
      <main className={`min-h-screen transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <Navigation />
        <HeroSection />
        <SelectedWorkSection />
        <AboutSection />
        <ContactSection />
      </main>
    </SmoothScroll>
  );
}
