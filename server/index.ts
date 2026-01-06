// server/index.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupSocket } from './socket';

const app = express();
const PORT = 3001; // Backend runs on 3001, Frontend on 3000

// Middleware
app.use(cors());

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow connection from Next.js
    methods: ["GET", "POST"]
  }
});

// Attach logic
setupSocket(io);

// Basic health check route
app.get('/', (req, res) => {
  res.send('Chronos Link Server is Running. Time-travel logic active.');
});

server.listen(PORT, () => {
  console.log(`
  🚀 SERVER STARTED ON PORT ${PORT}
  ---------------------------------
  📡 Listening for Time Travelers...
  `);
});