"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { onPlayRef, onPauseRef, onSeekRef, onSyncRequestRef, onSyncResponseRef } from "./SocketRefs";

interface User {
  id: string;
  name: string;
  isHost: boolean;
}

interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  lastUpdate: number;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  roomId: string | null;
  isHost: boolean;
  users: User[];
  videoState: VideoState | null;
  createRoom: (name: string) => Promise<{ success: boolean; roomId?: string; error?: string }>;
  joinRoom: (roomId: string, name: string) => Promise<{ success: boolean; error?: string }>;
  leaveRoom: () => void;
  emitPlay: (currentTime: number) => void;
  emitPause: (currentTime: number) => void;
  emitSeek: (currentTime: number) => void;
  requestSync: () => void;
  sendSyncResponse: (isPlaying: boolean, currentTime: number, requesterId?: string) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

// Debounce helper for number-based functions
function debounceNumber(fn: (time: number) => void, delay: number): (time: number) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (time: number) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(time), delay);
  };
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [videoState, setVideoState] = useState<VideoState | null>(null);
  
  // Store session info for reconnection
  const sessionRef = useRef<{ roomId: string; userName: string; wasHost: boolean } | null>(null);
  const reconnectAttemptedRef = useRef(false);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    newSocket.on("connect", () => {
      console.log("🔌 Connected to server");
      setIsConnected(true);
      
      // Auto-rejoin room on reconnect
      if (sessionRef.current && !reconnectAttemptedRef.current) {
        reconnectAttemptedRef.current = true;
        const { roomId: savedRoomId, userName } = sessionRef.current;
        
        console.log("🔄 Attempting to rejoin room:", savedRoomId);
        
        newSocket.emit("join-room", { roomId: savedRoomId, name: userName }, 
          (response: { success: boolean; roomId?: string; isHost?: boolean; users?: User[]; videoState?: VideoState; error?: string }) => {
            if (response.success) {
              console.log("✅ Rejoined room successfully");
              setRoomId(response.roomId || null);
              setIsHost(response.isHost || false);
              setUsers(response.users || []);
              if (response.videoState) {
                setVideoState(response.videoState);
              }
              // Request sync from host after rejoining
              setTimeout(() => {
                newSocket.emit("sync-request");
              }, 500);
            } else {
              console.log("❌ Failed to rejoin room:", response.error);
              // Room no longer exists, clear session
              sessionRef.current = null;
              setRoomId(null);
              setIsHost(false);
              setUsers([]);
            }
            reconnectAttemptedRef.current = false;
          }
        );
      }
    });

    newSocket.on("disconnect", (reason) => {
      console.log("🔌 Disconnected from server:", reason);
      setIsConnected(false);
      reconnectAttemptedRef.current = false;
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    // Room events
    newSocket.on("user-joined", (data) => {
      console.log("👤 User joined:", data);
      setUsers(data.users);
    });

    newSocket.on("user-left", (data) => {
      console.log("👤 User left:", data);
      setUsers(data.users);
    });

    newSocket.on("promoted-to-host", () => {
      console.log("👑 You are now the host!");
      setIsHost(true);
      if (sessionRef.current) {
        sessionRef.current.wasHost = true;
      }
    });

    newSocket.on("host-changed", (data) => {
      console.log("👑 New host:", data.newHostName);
    });

    // Playback events - use refs to call current handlers
    newSocket.on("play", (data) => {
      console.log("▶️ Play received:", data.currentTime);
      onPlayRef.current?.(data);
    });

    newSocket.on("pause", (data) => {
      console.log("⏸️ Pause received:", data.currentTime);
      onPauseRef.current?.(data);
    });

    newSocket.on("seek", (data) => {
      console.log("⏩ Seek received:", data.currentTime);
      onSeekRef.current?.(data);
    });

    newSocket.on("sync-request", () => {
      console.log("🔄 Sync request received");
      onSyncRequestRef.current?.();
    });

    newSocket.on("sync-response", (data) => {
      console.log("🔄 Sync response received:", data);
      onSyncResponseRef.current?.(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const createRoom = useCallback(async (name: string): Promise<{ success: boolean; roomId?: string; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket) {
        resolve({ success: false, error: "Not connected" });
        return;
      }

      socket.emit("create-room", { name }, (response: { success: boolean; roomId?: string; isHost?: boolean; users?: User[] }) => {
        if (response.success) {
          setRoomId(response.roomId || null);
          setIsHost(true);
          setUsers(response.users || []);
          // Save session for reconnection
          sessionRef.current = { 
            roomId: response.roomId || '', 
            userName: name, 
            wasHost: true 
          };
          resolve({ success: true, roomId: response.roomId });
        } else {
          resolve({ success: false, error: "Failed to create room" });
        }
      });
    });
  }, [socket]);

  const joinRoom = useCallback(async (roomCode: string, name: string): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (!socket) {
        resolve({ success: false, error: "Not connected" });
        return;
      }

      socket.emit("join-room", { roomId: roomCode, name }, (response: { success: boolean; roomId?: string; isHost?: boolean; users?: User[]; videoState?: VideoState; error?: string }) => {
        if (response.success) {
          setRoomId(response.roomId || null);
          setIsHost(false);
          setUsers(response.users || []);
          if (response.videoState) {
            setVideoState(response.videoState);
          }
          // Save session for reconnection
          sessionRef.current = { 
            roomId: response.roomId || '', 
            userName: name, 
            wasHost: false 
          };
          resolve({ success: true });
        } else {
          resolve({ success: false, error: response.error || "Failed to join room" });
        }
      });
    });
  }, [socket]);

  const leaveRoom = useCallback(() => {
    if (socket) {
      socket.emit("leave-room");
    }
    // Clear session on explicit leave
    sessionRef.current = null;
    setRoomId(null);
    setIsHost(false);
    setUsers([]);
    setVideoState(null);
  }, [socket]);

  // Debounced emit functions to prevent rapid-fire events
  const emitPlay = useCallback(
    debounceNumber((currentTime: number) => {
      if (socket && roomId) {
        socket.emit("play", { currentTime });
      }
    }, 100),
    [socket, roomId]
  );

  const emitPause = useCallback(
    debounceNumber((currentTime: number) => {
      if (socket && roomId) {
        socket.emit("pause", { currentTime });
      }
    }, 100),
    [socket, roomId]
  );

  const emitSeek = useCallback(
    debounceNumber((currentTime: number) => {
      if (socket && roomId) {
        socket.emit("seek", { currentTime });
      }
    }, 150),
    [socket, roomId]
  );

  const requestSync = useCallback(() => {
    if (socket && roomId) {
      socket.emit("sync-request");
    }
  }, [socket, roomId]);

  const sendSyncResponse = useCallback((isPlaying: boolean, currentTime: number, requesterId?: string) => {
    if (socket && roomId && isHost) {
      socket.emit("sync-response", { isPlaying, currentTime, requesterId });
    }
  }, [socket, roomId, isHost]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        roomId,
        isHost,
        users,
        videoState,
        createRoom,
        joinRoom,
        leaveRoom,
        emitPlay,
        emitPause,
        emitSeek,
        requestSync,
        sendSyncResponse,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
