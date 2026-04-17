import { Controller, Post, Body, Get, Param, Query, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  
  private readonly logger = new Logger(WhatsappController.name);

  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string, 
    @Query('hub.verify_token') token: string, 
    @Query('hub.challenge') challenge: string
  ) {
    // Este token secreto lo inventamos nosotros, luego lo pegaremos en Meta
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'omnicore_secreto_2026';
    
    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('✅ Webhook verificado por Meta!');
      // Meta exige que devolvamos el challenge en formato texto puro
      return challenge;
    }
    
    throw new HttpException('Token invalido', HttpStatus.FORBIDDEN);
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    // Procesamos y guardamos usando el servicio (Prisma)
    await this.whatsappService.processWebhook(body);
    
    // Respondemos a WhatsApp / Postman que lo recibimos correctamente
    return { status: 'success', message: 'Webhook procesado y simulado correctamente' };
  }

  // Endpoints para CMS (Angular)
  
  @Get('contacts')
  async getContacts() {
    return await this.whatsappService.getContacts();
  }

  @Post('contacts')
  async createContact(
    @Body('name') name: string,
    @Body('phoneNumber') phoneNumber: string
  ) {
    return await this.whatsappService.createContact(name, phoneNumber);
  }

  @Get('messages/:contactId')
  async getMessages(
    @Param('contactId') contactId: string,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string
  ) {
    return await this.whatsappService.getMessages(contactId, limit, cursor);
  }

  @Post('messages/:contactId')
  async sendMessage(
    @Param('contactId') contactId: string, 
    @Body('text') text: string
  ) {
    return await this.whatsappService.sendMessage(contactId, text);
  }

  @Post('contacts/:contactId/read')
  async markAsRead(@Param('contactId') contactId: string) {
    return await this.whatsappService.markContactAsRead(contactId);
  }

}
