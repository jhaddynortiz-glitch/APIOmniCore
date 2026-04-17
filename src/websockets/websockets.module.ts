import { Global, Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';

@Global()
@Module({
  providers: [ChatGateway],
  exports: [ChatGateway], // Exportamos para que cualquier otro módulo pueda emitir alertas
})
export class WebsocketsModule {}
