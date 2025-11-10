import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastPong, setLastPong] = useState<number | null>(null);
  const [userCount, setUserCount] = useState<number>(0);

  useEffect(() => {
    if (!socket) {
      socket = io(SERVER_URL, {
        autoConnect: true,
      });
    }

    const onConnect = () => {
      setIsConnected(true);
      socket?.emit('requestCanvas');
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onPong = (data: { timestamp: number }) => {
      setLastPong(data.timestamp);
    };

    const onUserCount = (count: number) => {
      setUserCount(count);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('pong', onPong);
    socket.on('userCount', onUserCount);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket?.off('connect', onConnect);
      socket?.off('disconnect', onDisconnect);
      socket?.off('pong', onPong);
      socket?.off('userCount', onUserCount);
    };
  }, []);

  const sendPing = () => {
    if (socket && isConnected) {
      socket.emit('ping');
    }
  };

  const setPixel = (x: number, y: number, color: string) => {
    if (socket && isConnected) {
      socket.emit('setPixel', { x, y, color });
    }
  };

  return {
    socket,
    isConnected,
    lastPong,
    sendPing,
    setPixel,
    userCount,
  };
};
