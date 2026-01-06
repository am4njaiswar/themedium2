// src/context/SocketContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Define the shape of the context
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 🔌 Connect ONLY once
    const socketInstance = io('http://localhost:3001', {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      console.log("✅ Socket Connected:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log("❌ Socket Disconnected");
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};