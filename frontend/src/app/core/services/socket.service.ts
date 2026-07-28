import { Injectable } from '@angular/core';
import { io, type Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { OrderStatus } from '../../shared/models';

export interface OrderStatusEvent {
  orderId: string;
  status: OrderStatus;
  note?: string;
}
export interface NewOrderEvent {
  orderId: string;
  total: number;
  items: unknown[];
}

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket = io(environment.wsUrl, { autoConnect: true, transports: ['websocket', 'polling'] });

  joinBuyerRoom(buyerId: string): void {
    this.socket.emit('join:buyer', buyerId);
  }

  joinSellerRoom(sellerId: string): void {
    this.socket.emit('join:seller', sellerId);
  }

  onOrderStatusUpdate(): Observable<OrderStatusEvent> {
    return this.fromEvent<OrderStatusEvent>('order:status_updated');
  }

  onPaymentConfirmed(): Observable<{ orderId: string }> {
    return this.fromEvent<{ orderId: string }>('order:payment_confirmed');
  }

  onNewOrder(): Observable<NewOrderEvent> {
    return this.fromEvent<NewOrderEvent>('order:new');
  }

  private fromEvent<T>(event: string): Observable<T> {
    return new Observable<T>((observer) => {
      const handler = (data: T): void => observer.next(data);
      this.socket.on(event, handler);
      return () => this.socket.off(event, handler);
    });
  }
}
