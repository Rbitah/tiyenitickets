import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class TicketGateway {
  @WebSocketServer()
  server: Server;

  emitTicketUpdate(ticketId: string, availableQuantity: number) {
    this.server.emit('ticketUpdate', { ticketId, availableQuantity });
  }

  @SubscribeMessage('subscribeToTicket')
  handleSubscribeToTicket(client: any, ticketId: string) {
    client.join(`ticket-${ticketId}`);
  }

  @SubscribeMessage('unsubscribeFromTicket')
  handleUnsubscribeFromTicket(client: any, ticketId: string) {
    client.leave(`ticket-${ticketId}`);
  }
} 