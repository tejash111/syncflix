"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "../context/SocketContext";

interface RoomControlsProps {
  userName: string;
  setUserName: (name: string) => void;
}

export default function RoomControls({ userName, setUserName }: RoomControlsProps) {
  const { isConnected, roomId, isHost, users, createRoom, joinRoom, leaveRoom } = useSocket();
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateRoom = async () => {
    if (!userName.trim()) {
      setError("Please enter your name");
      return;
    }
    
    setIsCreating(true);
    setError(null);
    
    const result = await createRoom(userName);
    
    if (!result.success) {
      setError(result.error || "Failed to create room");
    }
    
    setIsCreating(false);
  };

  const handleJoinRoom = async () => {
    if (!userName.trim()) {
      setError("Please enter your name");
      return;
    }
    
    if (!joinCode.trim()) {
      setError("Please enter a room code");
      return;
    }
    
    setIsJoining(true);
    setError(null);
    
    const result = await joinRoom(joinCode.toUpperCase(), userName);
    
    if (!result.success) {
      setError(result.error || "Failed to join room");
    }
    
    setIsJoining(false);
  };

  const copyRoomCode = async () => {
    if (roomId) {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyShareLink = async () => {
    if (roomId) {
      const url = `${window.location.origin}/watch?room=${roomId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center gap-3">
        <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-label">
          {isConnected ? "CONNECTED" : "CONNECTING..."}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {roomId ? (
          /* In Room */
          <motion.div
            key="in-room"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Room Code */}
            <div className="border border-white/10 p-6 text-center">
              <p className="text-label mb-3">ROOM CODE</p>
              <p className="room-code">{roomId}</p>
              
              <div className="flex gap-2 mt-6">
                <motion.button
                  onClick={copyRoomCode}
                  className="flex-1 btn-outline text-xs py-3"
                  whileTap={{ scale: 0.98 }}
                >
                  {copied ? "COPIED" : "COPY CODE"}
                </motion.button>
                
                <motion.button
                  onClick={copyShareLink}
                  className="flex-1 btn-primary text-xs py-3"
                  whileTap={{ scale: 0.98 }}
                >
                  SHARE LINK
                </motion.button>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-center justify-center gap-2">
              <span className={`text-label ${isHost ? "text-amber-400" : "text-cyan-400"}`}>
                {isHost ? "★ HOST" : "● GUEST"}
              </span>
            </div>

            {/* Users */}
            <div className="border border-white/5 p-4">
              <p className="text-label mb-4">WATCHING ({users.length})</p>
              <div className="space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 bg-white/[0.02]">
                    <div className="w-8 h-8 border border-white/20 flex items-center justify-center text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-white flex-1">{user.name}</span>
                    {user.isHost && (
                      <span className="text-[10px] text-amber-400 tracking-wider">HOST</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Leave */}
            <motion.button
              onClick={leaveRoom}
              className="w-full py-3 border border-white/10 text-[--text-secondary] text-xs tracking-widest hover:border-red-500/50 hover:text-red-400 transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              LEAVE ROOM
            </motion.button>
          </motion.div>
        ) : (
          /* Join/Create */
          <motion.div
            key="no-room"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Name Input */}
            <div>
              <label className="text-label block mb-2">YOUR NAME</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="input-field"
              />
            </div>

            {/* Create Room */}
            <motion.button
              onClick={handleCreateRoom}
              disabled={isCreating || !isConnected}
              className="w-full btn-primary py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              whileTap={{ scale: 0.98 }}
            >
              {isCreating ? "CREATING..." : "CREATE ROOM"}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 divider" />
              <span className="text-[10px] text-[--text-tertiary] tracking-widest">OR</span>
              <div className="flex-1 divider" />
            </div>

            {/* Join Room */}
            <div>
              <label className="text-label block mb-2">ROOM CODE</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXXXX"
                  className="input-field flex-1 font-mono tracking-[0.2em] text-center uppercase"
                  maxLength={8}
                />
                <motion.button
                  onClick={handleJoinRoom}
                  disabled={isJoining || !isConnected}
                  className="btn-outline px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileTap={{ scale: 0.98 }}
                >
                  {isJoining ? "..." : "JOIN"}
                </motion.button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 border border-red-500/20 text-red-400 text-xs"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
