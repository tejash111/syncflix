"use client";

import { ReactNode } from "react";

interface SmoothScrollProps {
  children: ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  // Simply render children - let native browser scrolling handle it
  // The smooth scroll is already enabled via scroll-behavior: smooth in globals.css
  return <>{children}</>;
}
