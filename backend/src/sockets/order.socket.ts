import type { Server, Socket } from 'socket.io';
import type { OrderStatus } from '../types';

let ioRef: Server | null = null;

/**
 * Register Socket.io connection handlers and store a reference to the server
 * so controllers can emit events without importing server.ts (avoids cycles).
 */
export function registerOrderSocket(io: Server): void {
  ioRef = io;

  io.on('connection', (socket: Socket) => {
    // Buyer joins their personal room
    socket.on('join:buyer', (buyerId: string) => {
      if (buyerId) socket.join(`buyer:${buyerId}`);
    });

    // Seller joins their room
    socket.on('join:seller', (sellerId: string) => {
      if (sellerId) socket.join(`seller:${sellerId}`);
    });

    socket.on('disconnect', () => {
      // no-op: rooms are cleaned up automatically
    });
  });
}

// ── Emit helpers used by controllers ──────────────────────

export function emitNewOrderToSeller(sellerId: string, payload: unknown): void {
  ioRef?.to(`seller:${sellerId}`).emit('order:new', payload);
}

export function emitOrderStatusToBuyer(
  buyerId: string,
  payload: { orderId: string; status: OrderStatus; note?: string },
): void {
  ioRef?.to(`buyer:${buyerId}`).emit('order:status_updated', payload);
}

export function emitPaymentConfirmedToBuyer(buyerId: string, payload: { orderId: string }): void {
  ioRef?.to(`buyer:${buyerId}`).emit('order:payment_confirmed', payload);
}
