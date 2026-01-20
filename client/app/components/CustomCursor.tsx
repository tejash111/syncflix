"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const [isPressed, setIsPressed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const animationRef = useRef<number>(0);
  const targetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Smooth interpolation animation loop
  useEffect(() => {
    if (!isMounted) return;

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const animate = () => {
      setSmoothPosition(prev => ({
        x: lerp(prev.x, targetRef.current.x, 0.15),
        y: lerp(prev.y, targetRef.current.y, 0.15),
      }));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    const updatePosition = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      setPosition({ x: e.clientX, y: e.clientY });
      setIsHidden(false);
    };

    const updateCursorType = (e: MouseEvent) => {
      const hoveredElement = document.elementFromPoint(e.clientX, e.clientY);
      if (hoveredElement) {
        const computedStyle = window.getComputedStyle(hoveredElement);
        setIsPointer(
          computedStyle.cursor === "pointer" ||
          hoveredElement.tagName === "A" ||
          hoveredElement.tagName === "BUTTON" ||
          hoveredElement.closest("a") !== null ||
          hoveredElement.closest("button") !== null
        );
      }
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);
    const handleMouseLeave = () => setIsHidden(true);
    const handleMouseEnter = () => setIsHidden(false);

    window.addEventListener("mousemove", updatePosition);
    window.addEventListener("mousemove", updateCursorType);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
      window.removeEventListener("mousemove", updateCursorType);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isMounted]);

  // Only render on client and desktop
  if (!isMounted || (typeof window !== "undefined" && window.innerWidth < 1024)) {
    return null;
  }

  return (
    <>
      {/* Main cursor dot - follows mouse instantly */}
      <div
        className={`fixed pointer-events-none z-[9999] mix-blend-difference ${
          isHidden ? "opacity-0" : "opacity-100"
        }`}
        style={{
          left: position.x,
          top: position.y,
          transform: `translate(-50%, -50%) scale(${isPressed ? 0.8 : 1})`,
          transition: "opacity 0.2s ease, transform 0.1s ease",
        }}
      >
        <div
          className={`rounded-full bg-white ${
            isPointer ? "w-4 h-4" : "w-2 h-2"
          }`}
          style={{
            transition: "width 0.2s ease, height 0.2s ease",
          }}
        />
      </div>

      {/* Trailing cursor ring - smooth follow with lerp */}
      <div
        className={`fixed pointer-events-none z-[9998] ${
          isHidden ? "opacity-0" : "opacity-100"
        }`}
        style={{
          left: smoothPosition.x,
          top: smoothPosition.y,
          transform: `translate(-50%, -50%) scale(${isPointer ? 1.5 : 1})`,
          transition: "opacity 0.3s ease, transform 0.2s ease",
        }}
      >
        <div
          className={`w-10 h-10 rounded-full border ${
            isPointer ? "border-white/50" : "border-white/25"
          } ${isPressed ? "scale-75" : ""}`}
          style={{
            transition: "border-color 0.2s ease, transform 0.15s ease",
          }}
        />
      </div>

      {/* Hide default cursor */}
      <style jsx global>{`
        @media (min-width: 1024px) {
          * {
            cursor: none !important;
          }
        }
      `}</style>
    </>
  );
}
