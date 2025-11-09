import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from './hooks/useSocket';

interface CanvasProps {
  selectedColor?: string;
}

function Canvas({ selectedColor = '#000000' }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number; y: number } | null>(null);
  const GRID_SIZE = 32;
  const PIXEL_SIZE = 20;
  
  const [canvasState, setCanvasState] = useState<string[][]>(() => 
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('#ffffff'))
  );
  const { socket, setPixel } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const onCanvasState = (state: string[][]) => {
      setCanvasState(state);
    };

    const onPixelUpdated = (data: { x: number; y: number; color: string }) => {
      setCanvasState((prev) => {
        if (prev.length === 0) return prev;
        const newState = prev.map(row => [...row]);
        if (newState[data.y]) {
          newState[data.y][data.x] = data.color;
        }
        return newState;
      });
    };

    socket.on('canvasState', onCanvasState);
    socket.on('pixelUpdated', onPixelUpdated);

    if (socket.connected) {
      socket.emit('requestCanvas');
    }

    return () => {
      socket.off('canvasState', onCanvasState);
      socket.off('pixelUpdated', onPixelUpdated);
    };
  }, [socket]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawGrid = () => {
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const isHovered = hoveredPixel && hoveredPixel.x === x && hoveredPixel.y === y;
          const pixelColor = canvasState[y]?.[x] || '#ffffff';
          
          ctx.fillStyle = isHovered ? darkenColor(pixelColor, 0.3) : pixelColor;
          ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
          
          ctx.strokeStyle = '#ddd';
          ctx.strokeRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
      }
    };

    drawGrid();
  }, [hoveredPixel, canvasState]);

  // Taken from online, I didn't write this function
  const darkenColor = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const newR = Math.max(0, Math.floor(r * (1 - amount)));
    const newG = Math.max(0, Math.floor(g * (1 - amount)));
    const newB = Math.max(0, Math.floor(b * (1 - amount)));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE);
    
    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      setHoveredPixel({ x, y });
    } else {
      setHoveredPixel(null);
    }
  };

  const handleCanvasMouseLeave = () => {
    setHoveredPixel(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE);
    
    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      setCanvasState((prev) => {
        if (prev.length === 0) return prev;
        const newState = prev.map(row => [...row]);
        if (newState[y]) {
          newState[y][x] = selectedColor;
        }
        return newState;
      });
      
      setPixel(x, y, selectedColor);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={GRID_SIZE * PIXEL_SIZE}
      height={GRID_SIZE * PIXEL_SIZE}
      onClick={handleCanvasClick}
      onMouseMove={handleCanvasMouseMove}
      onMouseLeave={handleCanvasMouseLeave}
      style={{ cursor: 'pointer', border: '1px solid #000' }}
    />
  );
}

export default Canvas;