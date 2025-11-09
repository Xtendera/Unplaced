import React, { useEffect, useRef } from 'react';

function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const GRID_SIZE = 32;
  const PIXEL_SIZE = 20;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawGrid = () => {
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          ctx.fillStyle = '#ffffff'; // WIP: Pixel color
          ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
          
          ctx.strokeStyle = '#ddd';
          ctx.strokeRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
        }
      }
    };

    drawGrid();
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / PIXEL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / PIXEL_SIZE);
    
    console.log('Clicked pixel:', x, y);
    
  };

  return (
    <canvas
      ref={canvasRef}
      width={GRID_SIZE * PIXEL_SIZE}
      height={GRID_SIZE * PIXEL_SIZE}
      onClick={handleCanvasClick}
      style={{ cursor: 'pointer', border: '1px solid #000' }}
    />
  );
}

export default Canvas;