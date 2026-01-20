"use client";

import React, { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SocketProvider, useSocket } from "../context/SocketContext";
import { onPlayRef, onPauseRef, onSeekRef, onSyncRequestRef, onSyncResponseRef } from "../context/SocketRefs";
import VideoPlayer from "../components/VideoPlayer";
import { FileUpload } from "@/components/ui/file-upload";
import RoomControls from "../components/RoomControls";

function WatchContent() {
  const searchParams = useSearchParams();
  const initialRoom = searchParams.get("room");

  const { roomId, isHost, emitPlay, emitPause, emitSeek, sendSyncResponse, joinRoom } = useSocket();
  
  const [userName, setUserName] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const isRemoteActionRef = useRef(false);

  // Auto-join room from URL
  useEffect(() => {
    if (initialRoom && !roomId && userName) {
      joinRoom(initialRoom, userName);
    }
  }, [initialRoom, roomId, userName, joinRoom]);

  // Handle file selection
  const handleFileSelect = useCallback((file: File, url: string) => {
    setVideoFile(file);
    setVideoUrl(url);
  }, []);

  // Play handler
  const handlePlay = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      
      if (!isRemoteActionRef.current && roomId) {
        emitPlay(videoRef.current.currentTime);
      }
      isRemoteActionRef.current = false;
    }
  }, [roomId, emitPlay]);

  // Pause handler
  const handlePause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      
      if (!isRemoteActionRef.current && roomId) {
        emitPause(videoRef.current.currentTime);
      }
      isRemoteActionRef.current = false;
    }
  }, [roomId, emitPause]);

  // Seek handler
  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      
      if (!isRemoteActionRef.current && roomId) {
        emitSeek(time);
      }
      isRemoteActionRef.current = false;
    }
  }, [roomId, emitSeek]);

  // Time update handler
  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  // Socket event handlers
  useEffect(() => {
    onPlayRef.current = (data) => {
      if (videoRef.current) {
        isRemoteActionRef.current = true;
        videoRef.current.currentTime = data.currentTime;
        videoRef.current.play();
        setIsPlaying(true);
      }
    };

    onPauseRef.current = (data) => {
      if (videoRef.current) {
        isRemoteActionRef.current = true;
        videoRef.current.currentTime = data.currentTime;
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    onSeekRef.current = (data) => {
      if (videoRef.current) {
        isRemoteActionRef.current = true;
        videoRef.current.currentTime = data.currentTime;
        setCurrentTime(data.currentTime);
      }
    };

    onSyncRequestRef.current = () => {
      if (videoRef.current && isHost) {
        sendSyncResponse(!videoRef.current.paused, videoRef.current.currentTime);
      }
    };

    onSyncResponseRef.current = (data) => {
      if (videoRef.current) {
        isRemoteActionRef.current = true;
        videoRef.current.currentTime = data.currentTime;
        if (data.isPlaying) {
          videoRef.current.play();
          setIsPlaying(true);
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    };

    return () => {
      onPlayRef.current = null;
      onPauseRef.current = null;
      onSeekRef.current = null;
      onSyncRequestRef.current = null;
      onSyncResponseRef.current = null;
    };
  }, [isHost, sendSyncResponse]);

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-[1800px] mx-auto px-8 lg:px-16">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="logo">
              <span className="logo-bold">SYNC</span>
              <span className="logo-light">FLIX</span>
            </Link>

            {/* Room Status */}
            <AnimatePresence>
              {roomId && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-4"
                >
                  <span className="text-label">ROOM</span>
                  <span className="room-code text-sm tracking-[0.2em]">{roomId}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle Sidebar */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16 min-h-screen flex">
        {/* Video Section */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-[1400px] mx-auto space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-label mb-2">WATCH PARTY</p>
              <h1 className="text-2xl font-light tracking-wide">
                Synchronized <span className="text-italic-accent">Viewing</span>
              </h1>
            </motion.div>

            {/* Video Player - Only shown when video is loaded */}
            <AnimatePresence>
              {videoUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="w-full max-w-[1400px] mx-auto"
                >
                  <VideoPlayer
                    videoUrl={videoUrl}
                    isPlaying={isPlaying}
                    currentTime={currentTime}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onSeek={handleSeek}
                    onTimeUpdate={handleTimeUpdate}
                    videoRef={videoRef}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* File Upload - Only shown when no video is loaded */}
            <AnimatePresence>
              {!videoUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-4xl mx-auto w-full"
                >
                  <FileUpload
                    onChange={(files: File[]) => {
                      if (files.length > 0) {
                        const file = files[0];
                        const url = URL.createObjectURL(file);
                        handleFileSelect(file, url);
                      }
                    }}
                  />
                  {/* Additional helper text if needed */}
                  <p className="text-center text-sm text-[--text-secondary] mt-4">
                    Supported formats: MP4, WebM, Ogg
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full lg:w-96 bg-[#050505] border-l border-white/5 p-8 overflow-y-auto fixed right-0 top-16 bottom-0 lg:relative lg:top-0 z-40"
            >
              <div className="space-y-8">
                <div>
                  <p className="text-label mb-2">SYNC ROOM</p>
                  <p className="text-sm text-[--text-secondary]">
                    Sync videos with friends in real-time
                  </p>
                </div>
                
                <div className="divider" />
                
                <RoomControls userName={userName} setUserName={setUserName} />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile FAB */}
      {!isSidebarOpen && (
        <motion.button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-white text-black flex items-center justify-center lg:hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        </motion.button>
      )}
    </div>
  );
}

function WatchPageContent() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="scroll-indicator">
          <div className="scroll-indicator-dot animate-pulse" />
        </div>
      </div>
    }>
      <WatchContent />
    </Suspense>
  );
}

export default function WatchPage() {
  return (
    <SocketProvider>
      <WatchPageContent />
    </SocketProvider>
  );
}
