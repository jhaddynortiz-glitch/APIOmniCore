import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../websockets/chat.gateway';
import { GptService } from '../gpt/gpt.service';
import { decrypt } from '../common/utils/crypto.util';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  private readonly DELIVERY_CENTER = {
    lat: -17.392774,
    lng: -66.158748,
    radiusKm: 5,
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly chatGateway: ChatGateway,
    private readonly gptService: GptService
  ) { }

  async verifyWebhookToken(token: string): Promise<boolean> {
    const org = await this.prisma.organization.findFirst({
      where: { whatsappVerifyToken: token }
    });
    return !!org;
  }

  async processWebhook(body: any) {
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const metadata = value?.metadata;
      const message = value?.messages?.[0];

      if (!message) {
        if (value?.statuses) {
          this.logger.log('ℹ️ Webhook de estado recibido.');
        }
        return;
      }

      // Identificamos la organización por el ID de teléfono de WhatsApp que recibe el mensaje
      const phoneId = metadata?.phone_number_id;
      const org = await this.prisma.organization.findFirst({
        where: { whatsappPhoneId: phoneId }
      });

      if (!org) {
        this.logger.error(`❌ Organización no encontrada para el Phone ID: ${phoneId}`);
        return;
      }

      const phoneNumber = message.from;
      const messageType = message.type;
      const bodyText = message.text?.body;
      const location = message.location;

      this.logger.log(`🔍 [${org.name}] Procesando mensaje de ${phoneNumber}. Tipo: ${messageType}`);

      // 2. Buscar o crear el contacto dentro de esta organización
      const contact = await this.prisma.contact.upsert({
        where: {
          organizationId_phoneNumber: {
            organizationId: org.id,
            phoneNumber: phoneNumber
          }
        },
        update: {
          unreadCount: { increment: 1 }
        },
        create: {
          phoneNumber: phoneNumber,
          name: 'Usuario WhatsApp',
          organizationId: org.id,
          unreadCount: 1
        }
      });

      // 3. Contenido del mensaje
      let savedBody = bodyText || '';
      let messageTypeForDb = 'text';

      if (messageType === 'location' && location) {
        savedBody = `📍 Ubicación: ${location.latitude}, ${location.longitude}`;
        if (location.name) savedBody += ` (${location.name})`;
        messageTypeForDb = 'location';
      }

      // 4. Guardar mensaje
      const createdMessage = await this.prisma.message.create({
        data: {
          body: savedBody,
          isFromMe: false,
          type: messageTypeForDb,
          contactId: contact.id
        }
      });

      // 5. Emitir evento
      this.chatGateway.emitNewMessage(createdMessage);

      // 6. Auto-reply (pasamos la organización para que use sus propias llaves)
      if (messageType === 'location' && location) {
        this.autoReplyWithLocation(org.id, contact.id, location.latitude, location.longitude).catch(err => {
          this.logger.error('Error en auto-reply de ubicación', err.message);
        });
      } else if (messageType === 'image') {
        const image = message.image;
        const mediaId = image.id;
        const caption = image.caption || '';
        
        try {
          const mediaUrl = await this.downloadWhatsappMedia(org, mediaId);
          savedBody = caption || '📷 Imagen';
          messageTypeForDb = 'image';
          
          const createdMessage = await this.prisma.message.create({
            data: {
              body: savedBody,
              mediaUrl: mediaUrl,
              mimeType: image.mime_type,
              isFromMe: false,
              type: messageTypeForDb,
              contactId: contact.id
            }
          });
          
          this.chatGateway.emitNewMessage(createdMessage);
          
          // Auto-reply for images too? Maybe just skip for now to avoid loops
          return createdMessage;
        } catch (err) {
          this.logger.error('Error procesando imagen de WhatsApp', err.message);
        }
      } else if (savedBody) {
        this.autoReplyWithGpt(org.id, contact.id, savedBody).catch(err => {
          this.logger.error('Error en auto-reply GPT', err.message);
        });
      }

      return createdMessage;
    } catch (error) {
      this.logger.error('Error procesando webhook de WhatsApp', error);
      throw error;
    }
  }

  async getContacts(organizationId: string) {
    try {
      const contacts = await this.prisma.contact.findMany({
        where: { organizationId },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      return contacts.sort((a, b) => {
        const dateA = a.messages[0]?.createdAt ? new Date(a.messages[0].createdAt).getTime() : new Date(a.createdAt).getTime();
        const dateB = b.messages[0]?.createdAt ? new Date(b.messages[0].createdAt).getTime() : new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    } catch (error) {
      this.logger.error('Error obteniendo contactos', error.stack);
      throw error;
    }
  }

  async getMessages(contactId: string, limit: number = 50, cursor?: string) {
    const options: any = {
      where: { contactId },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    };

    if (cursor) {
      options.cursor = { id: cursor };
      options.skip = 1;
    }

    const messages = await this.prisma.message.findMany(options);
    return messages.reverse();
  }

  async sendMessage(contactId: string, bodyText: string, type: string = 'text', mediaUrl?: string) {
    try {
      const contact = await this.prisma.contact.findUnique({
        where: { id: contactId },
        include: { Organization: true }
      });
      
      if (!contact) throw new NotFoundException('Contacto no encontrado');
      const org = contact.Organization;

      if (!org.whatsappToken || !org.whatsappPhoneId) {
        throw new Error(`La organización ${org.name} no tiene configuradas sus credenciales de WhatsApp`);
      }

      const decryptedToken = decrypt(org.whatsappToken);

      const url = `https://graph.facebook.com/v19.0/${org.whatsappPhoneId}/messages`;
      
      const payload: any = {
        messaging_product: 'whatsapp',
        to: contact.phoneNumber,
        type: type,
      };

      if (type === 'text') {
        payload.text = { body: bodyText };
      } else if (type === 'image') {
        payload.image = { link: mediaUrl, caption: bodyText };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${decryptedToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const metaData = await response.json();

      if (!response.ok) {
        this.logger.error(`Error desde Meta API para ${org.name}`, metaData);
        throw new Error(`Meta API Error: ${metaData.error?.message}`);
      }

      const createdMessage = await this.prisma.message.create({
        data: {
          body: bodyText,
          mediaUrl: mediaUrl,
          isFromMe: true,
          type: type,
          contactId: contactId,
        },
      });

      this.chatGateway.emitNewMessage(createdMessage);
      return createdMessage;
    } catch (error) {
      this.logger.error(`Error enviando mensaje a contacto ${contactId}`, error.stack);
      throw error;
    }
  }

  private async autoReplyWithGpt(orgId: string, contactId: string, userMessage: string) {
    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org?.openaiApiKey) return;

    const decryptedApiKey = decrypt(org.openaiApiKey);
    const { text, imageUrls } = await this.gptService.generateReply(contactId, userMessage, decryptedApiKey, orgId);

    // 1. Enviar las imágenes detectadas por la IA
    for (let url of imageUrls) {
      if (url.includes('localhost:3000')) {
        url = url.replace('localhost:3000', '192.168.100.4:3000');
      }
      
      try {
        await this.sendMessage(contactId, '', 'image', url);
      } catch (imgError) {
        this.logger.error(`❌ Fallo al enviar imagen a WhatsApp: ${imgError.message}`);
      }
    }

    // 2. Enviar el mensaje de texto final
    await this.sendMessage(contactId, text);
  }

  private async autoReplyWithLocation(orgId: string, contactId: string, lat: number, lng: number) {
    const distanceKm = this.calculateDistance(
      this.DELIVERY_CENTER.lat,
      this.DELIVERY_CENTER.lng,
      lat,
      lng
    );

    const isInRange = distanceKm <= this.DELIVERY_CENTER.radiusKm;
    
    const locationContext = isInRange
      ? `[SISTEMA: El cliente está a ${distanceKm.toFixed(1)} km. SÍ hay cobertura. Procesa el pedido.]`
      : `[SISTEMA: El cliente está a ${distanceKm.toFixed(1)} km. NO hay cobertura. Sugiere recojo en tienda.]`;

    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    const decryptedApiKey = org?.openaiApiKey ? decrypt(org.openaiApiKey) : undefined;

    const { text } = await this.gptService.generateReply(contactId, locationContext, decryptedApiKey!, orgId);
    await this.sendMessage(contactId, text);
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async markContactAsRead(contactId: string) {
    try {
      await this.prisma.contact.update({
        where: { id: contactId },
        data: { unreadCount: 0 }
      });
      this.logger.log(`👁️ Chat marcado como leído: ${contactId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error marcando como leído a ${contactId}`, error.stack);
      throw error;
    }
  }

  async createContact(name: string, phoneNumber: string, organizationId?: string) {
    try {
      // Si no viene orgId, usamos la primera (fallback para compatibilidad)
      let finalOrgId = organizationId;
      if (!finalOrgId) {
        const org = await this.prisma.organization.findFirst();
        if (!org) throw new Error('No se encontró ninguna organización');
        finalOrgId = org.id;
      }

      const cleanPhone = phoneNumber.replace(/\D/g, '');

      const contact = await this.prisma.contact.upsert({
        where: {
          organizationId_phoneNumber: {
            organizationId: finalOrgId,
            phoneNumber: cleanPhone
          }
        },
        update: { name },
        create: {
          phoneNumber: cleanPhone,
          name: name,
          organizationId: finalOrgId,
          unreadCount: 0
        },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      this.chatGateway.emitContactUpdated(contact);
      return contact;
    } catch (error) {
      this.logger.error('Error creando contacto manualmente', error.stack);
      throw error;
    }
  }

  private async downloadWhatsappMedia(org: any, mediaId: string): Promise<string> {
    const decryptedToken = decrypt(org.whatsappToken);
    
    // 1. Obtener URL de descarga
    const response = await fetch(`https://graph.facebook.com/v19.0/${mediaId}`, {
      headers: { 'Authorization': `Bearer ${decryptedToken}` }
    });
    const mediaData = await response.json();
    
    if (!response.ok || !mediaData.url) {
      throw new Error(`Error obteniendo URL de media: ${mediaData.error?.message || 'URL no encontrada'}`);
    }

    // 2. Descargar el archivo
    const fileResponse = await fetch(mediaData.url, {
      headers: { 'Authorization': `Bearer ${decryptedToken}` }
    });
    
    if (!fileResponse.ok) {
      throw new Error('Error descargando el archivo de los servidores de Meta');
    }

    const buffer = await fileResponse.arrayBuffer();
    const fileName = `${Date.now()}-${mediaId}.${mediaData.mime_type.split('/')[1]}`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);
    
    fs.writeFileSync(filePath, Buffer.from(buffer));
    
    return `http://localhost:3000/uploads/${fileName}`;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
