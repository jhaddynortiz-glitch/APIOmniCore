import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
  Logger,
  UseGuards,
  Request,
  HttpCode,
  Delete,
} from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(private readonly whatsappService: WhatsappService) {}

  // --- Webhooks (públicos, Meta los llama sin auth) ---

  @Get('webhook')
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    if (mode !== 'subscribe') {
      throw new HttpException('Modo inválido', HttpStatus.FORBIDDEN);
    }

    const isValid = await this.whatsappService.verifyWebhookToken(token);

    if (isValid) {
      this.logger.log('✅ Webhook verificado por Meta!');
      return challenge;
    }

    throw new HttpException('Token invalido', HttpStatus.FORBIDDEN);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() body: any) {
    this.logger.log('📩 Webhook recibido desde Meta');

    try {
      await this.whatsappService.processWebhook(body);
      return { status: 'success', message: 'Webhook procesado correctamente' };
    } catch (error) {
      this.logger.error('❌ Error procesando webhook:', (error as any).message);
      throw new HttpException(
        'Error interno procesando webhook',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // --- Endpoints protegidos (CMS Angular) ---
  // Todos filtran por la organización activa del JWT

  @UseGuards(JwtAuthGuard)
  @Get('contacts')
  async getContacts(@Request() req: any) {
    return await this.whatsappService.getContacts(req.user.orgId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('contacts')
  async createContact(
    @Request() req: any,
    @Body('name') name: string,
    @Body('phoneNumber') phoneNumber: string,
  ) {
    return await this.whatsappService.createContact(
      name,
      phoneNumber,
      req.user.orgId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('messages/:contactId')
  async getMessages(
    @Param('contactId') contactId: string,
    @Query('limit') limit?: number,
    @Query('cursor') cursor?: string,
  ) {
    return await this.whatsappService.getMessages(contactId, limit, cursor);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('messages/:contactId')
  async clearChat(@Param('contactId') contactId: string, @Request() req: any) {
    if (req.user.globalRole !== 'SUPER_ADMIN') {
      throw new HttpException(
        'Solo los super administradores pueden borrar el historial',
        HttpStatus.FORBIDDEN,
      );
    }
    return await this.whatsappService.clearChat(contactId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('messages/:contactId')
  async sendMessage(
    @Param('contactId') contactId: string,
    @Body('text') text: string,
    @Body('type') type?: string,
    @Body('mediaUrl') mediaUrl?: string,
  ) {
    try {
      return await this.whatsappService.sendMessage(
        contactId,
        text,
        type,
        mediaUrl,
      );
    } catch (error) {
      this.logger.error(
        `Error enviando mensaje por WhatsApp a contacto ${contactId}: ${(error as any).message}`,
      );
      throw new HttpException(
        (error as any).message || 'Error al enviar el mensaje por WhatsApp',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('contacts/:contactId/read')
  async markAsRead(@Param('contactId') contactId: string) {
    return await this.whatsappService.markContactAsRead(contactId);
  }
}
