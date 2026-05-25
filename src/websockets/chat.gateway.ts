import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

// Configuramos CORS para permitir a Angular (típicamente en el puerto 4200 localmente)
@WebSocketGateway({
  cors: {
    origin: '*',
    // origin: ['http://localhost:4200'], // Más seguro para producción
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  afterInit(server: Server) {
    this.logger.log(
      '✅ WebSockets Iniciados correctamente sobre puerto de NestJS',
    );
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`📱 Cliente conectado a WS (Angular) - id: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`⬅️ Cliente desconectado - id: ${client.id}`);
  }

  // Método que será llamado desde WhatsappService cuando haya un nuevo mensaje
  emitNewMessage(messagePayload: any) {
    this.logger.log(
      `[WS Emit] newMessage lanzado para Webhook -> ${messagePayload.contactId}`,
    );
    this.server.emit('newMessage', messagePayload);
  }

  // Nuevo método para notificar cambios en los datos del contacto (ej. nombre)
  emitContactUpdated(contactPayload: any) {
    console.log('📡 [WS] Emitiendo contactUpdated para:', contactPayload.name);
    this.server.emit('contactUpdated', contactPayload);
  }
}
