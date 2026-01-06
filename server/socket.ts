// server/socket.ts
import { Server, Socket } from 'socket.io';
import { getSimulationParams } from './engine/EraPhysics';
import { processSecurity } from './engine/MessageEncrypter';

export function setupSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join a default room
    socket.join('global_timeline');

    socket.on('send_message', (data) => {
      const { content, era, sender } = data;
      
      console.log(`[${era}] Message received from ${sender}: ${content}`);

      // 1. Ask Physics Engine: "How long should this take?"
      const physics = getSimulationParams(era);
      
      // 2. Handle Packet Loss (The "Frustration" Feature)
      if (physics.shouldDrop && era === '1990') {
        // Send a failure event ONLY to the sender
        setTimeout(() => {
          socket.emit('message_failed', { 
            error: "Connection Timed Out (Error 503)",
            timestamp: new Date()
          });
        }, physics.delay);
        return; // Stop execution, message dies here
      }

      // 3. Process Content (Encryption/Formatting)
      const processed = processSecurity(content, era);

      // 4. THE TIME TRAVEL DELAY
      setTimeout(() => {
        // Broadcast to EVERYONE (including sender) so they see it appear "live"
        io.to('global_timeline').emit('receive_message', {
          id: Date.now().toString(),
          text: processed.content,
          sender: sender,
          era: era,
          isSecured: processed.secured,
          timestamp: new Date().toISOString()
        });
        
        console.log(`[${era}] Delivered after ${physics.delay}ms`);
        
      }, physics.delay);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}