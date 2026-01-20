"use client";

import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploadProps {
  onFileSelect: (file: File, url: string) => void;
  currentFile: File | null;
}

export default function FileUpload({ onFileSelect, currentFile }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptedTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"];

  const handleFile = useCallback((file: File) => {
    if (!acceptedTypes.includes(file.type)) {
      setError("Please upload a valid video file (MP4, WebM, OGG, MOV, AVI)");
      return;
    }

    setError(null);
    const url = URL.createObjectURL(file);
    onFileSelect(file, url);
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {currentFile ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border border-white/10 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border border-white/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{currentFile.name}</p>
                <p className="text-xs text-[--text-tertiary] mt-1">{formatFileSize(currentFile.size)}</p>
              </div>
              <label className="btn-outline text-xs cursor-pointer py-2 px-4">
                CHANGE
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </label>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <label
              className={`dropzone flex flex-col items-center justify-center cursor-pointer ${
                isDragging ? "active" : ""
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="video/*"
                onChange={handleInputChange}
                className="hidden"
              />
              
              <motion.div
                className="scroll-indicator mb-6"
                animate={{ y: isDragging ? -5 : 0 }}
              >
                <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </motion.div>
              
              <p className="text-label mb-2">
                {isDragging ? "DROP HERE" : "UPLOAD VIDEO"}
              </p>
              <p className="text-xs text-[--text-tertiary]">
                Drag and drop or click to browse
              </p>
              <p className="text-xs text-[--text-muted] mt-4">
                MP4, WebM, OGG, MOV, AVI
              </p>
            </label>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 border border-red-500/20 text-red-400 text-xs"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
