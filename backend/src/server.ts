import { createServer } from 'http';
import { Server } from 'socket.io';

import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { registerOrderSocket } from './sockets/order.socket';

// ── Build HTTP server around the Express app ─────────────
const app = createApp();
const httpServer = createServer(app);

// ── Socket.io server ─────────────────────────────────────
export const io = new Server(httpServer, {
  cors: {
    origin: [env.frontendUrl, 'http://localhost:4200'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

registerOrderSocket(io);

// ── Boot ─────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  await connectDB();

  httpServer.listen(env.port, () => {
    console.log(`🚀 ShopSphere backend running on http://localhost:${env.port}`);
    console.log(`   Environment: ${env.nodeEnv}`);
    console.log(`   Socket.io ready`);
  });
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

// ── Graceful shutdown ────────────────────────────────────
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    console.log(`\n${signal} received — shutting down...`);
    httpServer.close(() => process.exit(0));
  });
}
