import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

// Production configuration from environment
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ["http://localhost:3000", "http://127.0.0.1:3000"];

const ROOM_TTL_HOURS = parseInt(process.env.ROOM_TTL_HOURS || '24', 10);
const ROOM_TTL_MS = ROOM_TTL_HOURS * 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

// Input validation helpers
const isValidTime = (time) => typeof time === 'number' && !isNaN(time) && time >= 0;
const sanitizeName = (name) => String(name || '').slice(0, 50).replace(/[<>]/g, '');

// Rate limiting for socket events
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 1000; // 1 second
const RATE_LIMIT_MAX = 10; // max events per window

const checkRateLimit = (socketId) => {
    const now = Date.now();
    const userRecord = rateLimitMap.get(socketId) || { count: 0, windowStart: now };

    if (now - userRecord.windowStart > RATE_LIMIT_WINDOW) {
        // Reset window
        userRecord.count = 1;
        userRecord.windowStart = now;
    } else {
        userRecord.count++;
    }

    rateLimitMap.set(socketId, userRecord);
    return userRecord.count <= RATE_LIMIT_MAX;
};

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: ALLOWED_ORIGINS,
        methods: ["GET", "POST"],
        credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

app.use(cors());
app.use(express.json());

// Store active rooms
const rooms = new Map();

// Room structure:
// {
//   id: string,
//   hostId: string,
//   hostName: string,
//   users: Map<socketId, { id, name, isHost }>,
//   videoState: { isPlaying: boolean, currentTime: number, lastUpdate: number }
// }

app.get('/', (req, res) => {
    res.json({
        status: 'Movie Sync Server Running',
        activeRooms: rooms.size
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', rooms: rooms.size });
});

// Cleanup stale rooms periodically
setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    rooms.forEach((room, id) => {
        if (now - room.videoState.lastUpdate > ROOM_TTL_MS && room.users.size === 0) {
            rooms.delete(id);
            cleaned++;
        }
    });
    if (cleaned > 0) {
        console.log(`🧹 Cleaned up ${cleaned} stale room(s)`);
    }
}, CLEANUP_INTERVAL_MS);

io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // Create a new room
    socket.on('create-room', (data, callback) => {
        try {
            const roomId = uuidv4().substring(0, 8).toUpperCase();
            const userName = sanitizeName(data?.name) || 'Host';

            const room = {
                id: roomId,
                hostId: socket.id,
                hostName: userName,
                users: new Map(),
                videoState: {
                    isPlaying: false,
                    currentTime: 0,
                    lastUpdate: Date.now()
                }
            };

            room.users.set(socket.id, {
                id: socket.id,
                name: userName,
                isHost: true
            });

            rooms.set(roomId, room);
            socket.join(roomId);
            socket.roomId = roomId;
            socket.isHost = true;

            console.log(`🎬 Room created: ${roomId} by ${userName}`);

            callback({
                success: true,
                roomId,
                isHost: true,
                users: Array.from(room.users.values())
            });
        } catch (error) {
            console.error('Error creating room:', error);
            callback({ success: false, error: 'Failed to create room' });
        }
    });

    // Join an existing room
    socket.on('join-room', (data, callback) => {
        try {
            const { roomId, name } = data || {};
            const userName = sanitizeName(name) || 'Guest';
            const room = rooms.get(roomId?.toUpperCase());

            if (!room) {
                callback({ success: false, error: 'Room not found' });
                return;
            }

            room.users.set(socket.id, {
                id: socket.id,
                name: userName,
                isHost: false
            });

            socket.join(roomId.toUpperCase());
            socket.roomId = roomId.toUpperCase();
            socket.isHost = false;

            // Notify others in room
            socket.to(room.id).emit('user-joined', {
                userId: socket.id,
                name: userName,
                users: Array.from(room.users.values())
            });

            console.log(`👤 ${userName} joined room: ${roomId}`);

            callback({
                success: true,
                roomId: room.id,
                isHost: false,
                users: Array.from(room.users.values()),
                videoState: room.videoState
            });
        } catch (error) {
            console.error('Error joining room:', error);
            callback({ success: false, error: 'Failed to join room' });
        }
    });

    // Video play event
    socket.on('play', (data) => {
        if (!checkRateLimit(socket.id)) return;
        const room = rooms.get(socket.roomId);
        if (!room) return;

        const currentTime = isValidTime(data?.currentTime) ? data.currentTime : 0;

        room.videoState = {
            isPlaying: true,
            currentTime,
            lastUpdate: Date.now()
        };

        socket.to(room.id).emit('play', {
            currentTime,
            triggeredBy: socket.id
        });

        console.log(`▶️ Play at ${currentTime.toFixed(2)}s in room ${room.id}`);
    });

    // Video pause event
    socket.on('pause', (data) => {
        if (!checkRateLimit(socket.id)) return;
        const room = rooms.get(socket.roomId);
        if (!room) return;

        const currentTime = isValidTime(data?.currentTime) ? data.currentTime : 0;

        room.videoState = {
            isPlaying: false,
            currentTime,
            lastUpdate: Date.now()
        };

        socket.to(room.id).emit('pause', {
            currentTime,
            triggeredBy: socket.id
        });

        console.log(`⏸️ Pause at ${currentTime.toFixed(2)}s in room ${room.id}`);
    });

    // Video seek event
    socket.on('seek', (data) => {
        if (!checkRateLimit(socket.id)) return;
        const room = rooms.get(socket.roomId);
        if (!room) return;

        const currentTime = isValidTime(data?.currentTime) ? data.currentTime : 0;

        room.videoState.currentTime = currentTime;
        room.videoState.lastUpdate = Date.now();

        socket.to(room.id).emit('seek', {
            currentTime,
            triggeredBy: socket.id
        });

        console.log(`⏩ Seek to ${currentTime.toFixed(2)}s in room ${room.id}`);
    });

    // Request sync from host
    socket.on('sync-request', () => {
        const room = rooms.get(socket.roomId);
        if (!room) return;

        // Send request to host
        io.to(room.hostId).emit('sync-request', {
            requesterId: socket.id
        });
    });

    // Host responds with current state
    socket.on('sync-response', (data) => {
        const room = rooms.get(socket.roomId);
        if (!room || !socket.isHost) return;

        room.videoState = {
            isPlaying: data.isPlaying,
            currentTime: data.currentTime,
            lastUpdate: Date.now()
        };

        // Send to specific requester or broadcast
        if (data.requesterId) {
            io.to(data.requesterId).emit('sync-response', {
                isPlaying: data.isPlaying,
                currentTime: data.currentTime
            });
        } else {
            socket.to(room.id).emit('sync-response', {
                isPlaying: data.isPlaying,
                currentTime: data.currentTime
            });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.id}`);

        if (socket.roomId) {
            const room = rooms.get(socket.roomId);
            if (room) {
                room.users.delete(socket.id);

                // Notify others
                socket.to(room.id).emit('user-left', {
                    userId: socket.id,
                    users: Array.from(room.users.values())
                });

                // If host left, close room or assign new host
                if (socket.isHost) {
                    if (room.users.size > 0) {
                        // Assign new host
                        const newHostEntry = room.users.entries().next().value;
                        if (newHostEntry) {
                            const [newHostId, newHostUser] = newHostEntry;
                            room.hostId = newHostId;
                            newHostUser.isHost = true;

                            io.to(newHostId).emit('promoted-to-host');
                            io.to(room.id).emit('host-changed', {
                                newHostId,
                                newHostName: newHostUser.name
                            });

                            console.log(`👑 New host in room ${room.id}: ${newHostUser.name}`);
                        }
                    } else {
                        // Delete empty room
                        rooms.delete(socket.roomId);
                        console.log(`🗑️ Room deleted: ${socket.roomId}`);
                    }
                }
            }
        }
    });

    // Leave room explicitly
    socket.on('leave-room', () => {
        if (socket.roomId) {
            const room = rooms.get(socket.roomId);
            if (room) {
                room.users.delete(socket.id);
                socket.to(room.id).emit('user-left', {
                    userId: socket.id,
                    users: Array.from(room.users.values())
                });
                socket.leave(socket.roomId);
            }
            socket.roomId = null;
            socket.isHost = false;
        }
    });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════╗
  ║   🎬 Movie Sync Server Running       ║
  ║   Port: ${PORT}                          ║
  ║   http://localhost:${PORT}              ║
  ╚══════════════════════════════════════╝
  `);
});
