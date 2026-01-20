"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#work", label: "FEATURES" },
    { href: "/watch", label: "WATCH" },
    { href: "#about", label: "HOW IT WORKS" },
    { href: "#contact", label: "CONTACT" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out-expo border-b ${
        scrolled ? "glass border-white/10" : "border-transparent bg-transparent"
      }`}
      style={{ height: "var(--nav-height)" }}
    >
      <nav className="flex items-center justify-between h-full px-8 md:px-12 lg:px-16">
        {/* Logo */}
        <Link href="/" className="logo group relative overflow-hidden">
          <span className="logo-bold relative z-10 transition-transform duration-300 group-hover:-translate-y-full inline-block">
            SYNC
          </span>
          <span className="logo-light relative z-10 transition-transform duration-300 group-hover:-translate-y-full inline-block">
            FLIX
          </span>
          <span className="absolute top-full left-0 logo-bold transition-transform duration-300 group-hover:-translate-y-full">
            SYNC
          </span>
          <span className="absolute top-full logo-light transition-transform duration-300 group-hover:-translate-y-full" style={{ left: "48px" }}>
            FLIX
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-link relative overflow-hidden group h-[20px]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="relative z-10 inline-block transition-transform duration-300 ease-out group-hover:-translate-y-full">
                {link.label}
              </span>
              <span className="absolute top-full left-0 right-0 text-center transition-transform duration-300 ease-out group-hover:-translate-y-full text-white">
                {link.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`w-6 h-px bg-white transition-all duration-300 ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`w-6 h-px bg-white transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`w-6 h-px bg-white transition-all duration-300 ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 top-[var(--nav-height)] bg-black transition-all duration-500 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className="hero-title text-4xl"
              onClick={() => setMenuOpen(false)}
              style={{
                animationDelay: `${index * 100}ms`,
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? "translateY(0)" : "translateY(20px)",
                transition: `all 0.5s ease ${index * 100}ms`,
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
