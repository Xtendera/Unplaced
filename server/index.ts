import express from 'express';
import { createServer } from 'http';
import { Server, type Socket } from 'socket.io';
import cors from 'cors';

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const GRID_SIZE = 32;
const COOLDOWN_MS = 60000;

let globalCanvas: string[][] = Array(GRID_SIZE).fill(null).map(() => 
  Array(GRID_SIZE).fill('#ffffff')
);

const userCooldowns = new Map<string, number>();
const userColors = new Map<string, string>();
const availableColors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
let colorIndex = 0;

const assignUserColor = (socketId: string): string => {
  const color = availableColors[colorIndex % availableColors.length] || '#3b82f6';
  colorIndex++;
  userColors.set(socketId, color);
  return color;
};

const resetCanvas = () => {
  globalCanvas = Array(GRID_SIZE).fill(null).map(() => 
    Array(GRID_SIZE).fill('#ffffff')
  );
  io.emit('canvasReset', globalCanvas);
};

const getTimeUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
};

const scheduleNextReset = () => {
  const timeUntilMidnight = getTimeUntilMidnight();
  setTimeout(() => {
    resetCanvas();
    scheduleNextReset();
  }, timeUntilMidnight);
};

scheduleNextReset();

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket: Socket) => {
  const userColor = assignUserColor(socket.id);
  
  socket.emit('canvasState', globalCanvas);
  socket.emit('nextReset', getTimeUntilMidnight());
  socket.emit('userColor', userColor);
  
  io.emit('userCount', io.engine.clientsCount);

  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });

  socket.on('requestCanvas', () => {
    socket.emit('canvasState', globalCanvas);
    socket.emit('nextReset', getTimeUntilMidnight());
  });

  socket.on('cursorMove', (data: { x: number; y: number }) => {
    socket.broadcast.emit('userCursor', {
      userId: socket.id,
      x: data.x,
      y: data.y,
      color: userColor
    });
  });

  socket.on('setPixel', (data: { x: number; y: number; color: string }) => {
    const { x, y, color } = data;
    const now = Date.now();
    const lastPlacement = userCooldowns.get(socket.id) || 0;
    const timeRemaining = COOLDOWN_MS - (now - lastPlacement);
    
    if (timeRemaining > 0) {
      socket.emit('cooldownError', { timeRemaining });
      return;
    }
    
    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE && globalCanvas[y]) {
      globalCanvas[y][x] = color;
      userCooldowns.set(socket.id, now);
      io.emit('pixelUpdated', { x, y, color });
      socket.emit('cooldownStart', { cooldownMs: COOLDOWN_MS });
    }
  });

  socket.on('setPixels', (data: { pixels: Array<{ x: number; y: number }>; color: string }) => {
    const { pixels, color } = data;
    const now = Date.now();
    const lastPlacement = userCooldowns.get(socket.id) || 0;
    const timeRemaining = COOLDOWN_MS - (now - lastPlacement);
    
    if (timeRemaining > 0) {
      socket.emit('cooldownError', { timeRemaining });
      return;
    }
    
    pixels.forEach(({ x, y }) => {
      if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE && globalCanvas[y]) {
        globalCanvas[y][x] = color;
        io.emit('pixelUpdated', { x, y, color });
      }
    });
    
    userCooldowns.set(socket.id, now);
    socket.emit('cooldownStart', { cooldownMs: COOLDOWN_MS });
  });
  
  socket.on('disconnect', () => {
    userCooldowns.delete(socket.id);
    userColors.delete(socket.id);
    socket.broadcast.emit('userLeft', socket.id);
    io.emit('userCount', io.engine.clientsCount);
  });
});

httpServer.listen(PORT, () => {});