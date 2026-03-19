import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*'
  },
  namespace: '/escrows'
})
export class EscrowGateway {
  private readonly logger = new Logger(EscrowGateway.name);

  @WebSocketServer()
  server!: Server;

  broadcastUpdate(event: string, payload: unknown): void {
    this.logger.debug(`Broadcasting websocket event ${event}`);
    this.server.emit(event, payload);
  }
}
