import express from 'express';
import { createServer } from 'http';
import { Server, type Socket } from 'socket.io';
import cors from 'cors';

const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const GRID_SIZE = 32;

const globalCanvas: string[][] = Array(GRID_SIZE).fill(null).map(() => 
  Array(GRID_SIZE).fill('#ffffff')
);

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
  socket.emit('canvasState', globalCanvas);

  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });

  socket.on('requestCanvas', () => {
    socket.emit('canvasState', globalCanvas);
  });

  socket.on('setPixel', (data: { x: number; y: number; color: string }) => {
    const { x, y, color } = data;
    
    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE && globalCanvas[y]) {
      globalCanvas[y][x] = color;
      io.emit('pixelUpdated', { x, y, color });
    }
  });
  
  socket.on('disconnect', () => {});
});

httpServer.listen(PORT, () => {});