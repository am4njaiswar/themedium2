// src/hooks/useSocket.ts
import { useSocket as useSocketContext } from '@/context/SocketContext';

// This simply re-exports the hook from the context for cleaner imports
export default function useSocket() {
  const { socket } = useSocketContext();
  return socket;
}