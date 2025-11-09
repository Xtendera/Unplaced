import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastPong, setLastPong] = useState<number | null>(null);

  useEffect(() => {
    if (!socket) {
      socket = io(SERVER_URL, {
        autoConnect: true,
      });
    }

    const onConnect = () => {
      console.log('Connected to server');
      setIsConnected(true);
    };

    const onDisconnect = () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    };

    const onPong = (data: { timestamp: number }) => {
      setLastPong(data.timestamp);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('pong', onPong);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket?.off('connect', onConnect);
      socket?.off('disconnect', onDisconnect);
      socket?.off('pong', onPong);
    };
  }, []);

  const sendPing = () => {
    if (socket && isConnected) {
      socket.emit('ping');
    }
  };

  return {
    socket,
    isConnected,
    lastPong,
    sendPing,
  };
};
