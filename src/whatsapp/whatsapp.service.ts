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
  }; //add comment

  constructor(
    private readonly prisma: PrismaService,
    private readonly chatGateway: ChatGateway,
    private readonly gptService: GptService,
  ) {}

  async verifyWebhookToken(token: string): Promise<boolean> {
    const org = await this.prisma.organization.findFirst({
      where: { whatsappVerifyToken: token },
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
        } else {
          this.logger.debug(
            'ℹ️ Webhook recibido sin mensajes ni estados:',
            JSON.stringify(body),
          );
        }
        return;
      }

      // 0. Evitar procesamiento duplicado (Meta reintenta webhooks)
      if (message.id) {
        const existingMessage = await this.prisma.message.findUnique({
          where: { id: message.id },
        });

        if (existingMessage) {
          this.logger.warn(
            `⚠️ Webhook duplicado ignorado. Mensaje ya procesado: ${message.id}`,
          );
          return;
        }
      }

      // Identificamos la organización por el ID de teléfono de WhatsApp que recibe el mensaje
      const phoneId = metadata?.phone_number_id;
      let org = await this.prisma.organization.findFirst({
        where: { whatsappPhoneId: phoneId },
      });

      // Fallback: Si no coincide el ID, intentamos usar la primera organización (útil en entornos de prueba o desajustes de ID)
      if (!org) {
        this.logger.warn(
          `⚠️ Phone ID ${phoneId} no coincide. Usando fallback de la primera organización.`,
        );
        org = await this.prisma.organization.findFirst();
      }

      if (!org) {
        this.logger.error(
          `❌ No se encontró ninguna organización para procesar el mensaje.`,
        );
        return;
      }

      const phoneNumber = message.from;
      const messageType = message.type;
      let bodyText = message.text?.body;
      const location = message.location;
      const referral = message.referral;

      this.logger.log(
        `🔍 [${org.name}] Procesando mensaje de ${phoneNumber}. Tipo: ${messageType}`,
      );

      let matchedProduct = null;
      if (referral && referral.source_type === 'ad' && referral.source_id) {
        const adId = referral.source_id;
        matchedProduct = await this.prisma.product.findFirst({
          where: {
            organizationId: org.id,
            ads: { some: { adId: { contains: adId } } },
          },
        });

        if (matchedProduct) {
          this.logger.log(
            `🛍️ Anuncio vinculado al producto: ${matchedProduct.name} (ID: ${adId})`,
          );
        } else {
          this.logger.log(
            `🛍️ Anuncio (ID: ${adId}) detectado pero no vinculado a producto en DB: ${referral.headline}`,
          );
          bodyText = `[SISTEMA CONTEXTO: El cliente viene del anuncio "${referral.headline}"]\n\nEl cliente dice: ${bodyText || 'Hola'}`;
        }
      }

      // MODO PRUEBA: Si el cliente no viene de un anuncio pero escribe literalmente el ID
      if (!matchedProduct && bodyText) {
        const testId = bodyText.trim();
        // Aumentado a 100 caracteres porque los IDs 'pfbid' de Facebook son muy largos (aprox 70 chars)
        if (testId.length < 100) {
          matchedProduct = await this.prisma.product.findFirst({
            where: {
              organizationId: org.id,
              ads: { some: { adId: { contains: testId } } },
            },
          });
          if (matchedProduct) {
            this.logger.log(
              `🛠️ [MODO PRUEBA] El texto enviado coincide con el ID de anuncio: ${matchedProduct.name}`,
            );
          }
        }
      }

      // 2. Buscar o crear el contacto dentro de esta organización
      const contact = await this.prisma.contact.upsert({
        where: {
          organizationId_phoneNumber: {
            organizationId: org.id,
            phoneNumber: phoneNumber,
          },
        },
        update: {
          unreadCount: { increment: 1 },
        },
        create: {
          phoneNumber: phoneNumber,
          name: 'Usuario WhatsApp',
          organizationId: org.id,
          unreadCount: 1,
        },
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
          id: message.id, // Guardamos el ID real de Meta para evitar duplicados
          body: savedBody,
          isFromMe: false,
          type: messageTypeForDb,
          contactId: contact.id,
        },
      });

      // 5. Emitir evento
      this.chatGateway.emitNewMessage(createdMessage);

      // 6. Auto-reply (pasamos la organización para que use sus propias llaves)
      if (messageType === 'location' && location) {
        this.autoReplyWithLocation(
          org.id,
          contact.id,
          location.latitude,
          location.longitude,
        ).catch((err) => {
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
              id: message.id, // Guardamos el ID real de Meta
              body: savedBody,
              mediaUrl: mediaUrl,
              mimeType: image.mime_type,
              isFromMe: false,
              type: messageTypeForDb,
              contactId: contact.id,
            },
          });

          this.chatGateway.emitNewMessage(createdMessage);

          // Auto-reply for images too? Maybe just skip for now to avoid loops
          return createdMessage;
        } catch (err: unknown) {
          this.logger.error(
            'Error procesando imagen de WhatsApp',
            err instanceof Error ? err.message : String(err),
          );
        }
      } else if (savedBody) {
        // Verificar Disparadores / Respuestas de Servidor primero
        const matchedTrigger = await this.checkForTriggers(org.id, savedBody);
        if (matchedTrigger) {
          this.logger.log(
            `🎯 Disparador de servidor activado por palabra clave: "${matchedTrigger.keyword}"`,
          );
          await this.sendMessage(contact.id, matchedTrigger.response);
          return createdMessage;
        }

        if (matchedProduct) {
          this.autoReplyWithProductDetails(
            org.id,
            contact.id,
            matchedProduct,
          ).catch((err) => {
            this.logger.error(
              'Error en auto-reply con detalles del producto',
              err.message,
            );
          });
        } else {
          this.autoReplyWithGpt(org.id, contact.id, savedBody).catch((err) => {
            this.logger.error('Error en auto-reply GPT', err.message);
          });
        }
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
            take: 1,
          },
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      return contacts.sort((a, b) => {
        const dateA = a.messages[0]?.createdAt
          ? new Date(a.messages[0].createdAt).getTime()
          : new Date(a.createdAt).getTime();
        const dateB = b.messages[0]?.createdAt
          ? new Date(b.messages[0].createdAt).getTime()
          : new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    } catch (error: unknown) {
      this.logger.error(
        'Error obteniendo contactos',
        error instanceof Error ? error.stack : String(error),
      );
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

  async sendMessage(
    contactId: string,
    bodyText: string,
    type: string = 'text',
    mediaUrl?: string,
  ) {
    try {
      const contact = await this.prisma.contact.findUnique({
        where: { id: contactId },
        include: { Organization: true },
      });

      if (!contact) throw new NotFoundException('Contacto no encontrado');
      const org = contact.Organization;

      if (!org.whatsappToken || !org.whatsappPhoneId) {
        throw new Error(
          `La organización ${org.name} no tiene configuradas sus credenciales de WhatsApp`,
        );
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
          Authorization: `Bearer ${decryptedToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
    } catch (error: unknown) {
      this.logger.error(
        `Error enviando mensaje a contacto ${contactId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  private async autoReplyWithProductDetails(
    orgId: string,
    contactId: string,
    product: any,
  ) {
    const caption = `📦 *${product.name}*\n\n${product.description ? product.description + '\n\n' : ''}💰 *Precio:* ${product.currency} ${product.price}\n\n¿En qué te podemos ayudar?`;

    if (product.imageUrl) {
      let finalUrl = product.imageUrl;
      if (!finalUrl.startsWith('http')) {
        const baseUrl = process.env.API_URL || 'http://localhost:3000';
        finalUrl = `${baseUrl}${finalUrl}`;
      }
      await this.sendMessage(contactId, caption, 'image', finalUrl);
    } else {
      await this.sendMessage(contactId, caption, 'text');
    }
  }

  private async autoReplyWithGpt(
    orgId: string,
    contactId: string,
    userMessage: string,
  ) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });
    if (!org?.openaiApiKey) return;

    const decryptedApiKey = decrypt(org.openaiApiKey);
    const { text, imageUrls } = await this.gptService.generateReply(
      contactId,
      userMessage,
      decryptedApiKey,
      orgId,
    );

    // 1. Enviar las imágenes detectadas por la IA
    const apiUrl = process.env.API_URL || 'http://localhost:3000';

    for (let url of imageUrls) {
      const baseUrl = process.env.API_URL || 'http://localhost:3000';
      if (url.includes('localhost:3000')) {
        url = url.replace(
          'localhost:3000',
          baseUrl.replace('http://', '').replace('https://', ''),
        );
      }

      try {
        await this.sendMessage(contactId, '', 'image', url);
      } catch (imgError: unknown) {
        this.logger.error(
          `❌ Fallo al enviar imagen a WhatsApp: ${imgError instanceof Error ? imgError.message : String(imgError)}`,
        );
      }
    }

    // 2. Enviar el mensaje de texto final
    await this.sendMessage(contactId, text);
  }

  private async autoReplyWithLocation(
    orgId: string,
    contactId: string,
    lat: number,
    lng: number,
  ) {
    // 1. Obtener todas las zonas de delivery configuradas para esta organización, incluyendo sus radios
    const deliveryZones = await this.prisma.deliveryZone.findMany({
      where: { organizationId: orgId },
      include: {
        radii: {
          orderBy: { distanceKm: 'asc' },
        },
      },
    });

    let closestZone = null;
    let closestRadius = null;
    let minDistance = Infinity;

    // 2. Buscar si el cliente cae dentro del rango de alguna de las zonas
    for (const zone of deliveryZones) {
      const distance = this.calculateDistance(zone.lat, zone.lng, lat, lng);

      // Encontrar el primer radio que cubra esta distancia en esta zona
      const matchingRadius = zone.radii.find((r) => distance <= r.distanceKm);

      if (matchingRadius) {
        // Encontramos cobertura! Si es la más cercana o la primera, la registramos
        if (distance < minDistance) {
          minDistance = distance;
          closestZone = zone;
          closestRadius = matchingRadius;
        }
      } else {
        // Si no está dentro de ningún radio, registramos la distancia al centro para informar
        if (distance < minDistance) {
          minDistance = distance;
        }
      }
    }

    let locationContext = '';

    if (closestZone && closestRadius) {
      // Sí está en cobertura!
      this.logger.log(
        `📍 Cobertura de delivery detectada en ${closestZone.city} a ${minDistance.toFixed(2)} km. Tarifa: ${closestRadius.price} Bs.`,
      );
      locationContext = `[SISTEMA: El cliente ha enviado su ubicación. Se determinó que se encuentra en la ciudad de ${closestZone.city} a una distancia de ${minDistance.toFixed(1)} km de nuestro centro de envíos. SÍ hay cobertura. El costo de delivery es de ${closestRadius.price} Bs. Procesa el pedido informándole al cliente que el envío cuesta ${closestRadius.price} Bs y agrégalo al total de su compra.]`;
    } else {
      // Fuera de cobertura!
      this.logger.warn(
        `📍 Ubicación fuera de cobertura. Distancia mínima al centro de envíos más cercano: ${minDistance.toFixed(2)} km.`,
      );
      locationContext = `[SISTEMA: El cliente ha enviado su ubicación. Se calculó que está a ${minDistance === Infinity ? 'muchos' : minDistance.toFixed(1)} km de distancia de nuestro centro de envíos más cercano. NO hay cobertura de delivery para su zona. Informa amablemente al cliente que lamentablemente no contamos con cobertura de delivery hasta esa dirección, y ofrécele de forma clara las sucursales físicas (locales) o puntos de encuentro disponibles para el recojo de su pedido.]`;
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });
    const decryptedApiKey = org?.openaiApiKey
      ? decrypt(org.openaiApiKey)
      : undefined;

    const { text } = await this.gptService.generateReply(
      contactId,
      locationContext,
      decryptedApiKey!,
      orgId,
    );
    await this.sendMessage(contactId, text);
  }

  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async markContactAsRead(contactId: string) {
    try {
      await this.prisma.contact.update({
        where: { id: contactId },
        data: { unreadCount: 0 },
      });
      this.logger.log(`👁️ Chat marcado como leído: ${contactId}`);
      return { success: true };
    } catch (error: unknown) {
      this.logger.error(
        `Error marcando como leído a ${contactId}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async createContact(
    name: string,
    phoneNumber: string,
    organizationId?: string,
  ) {
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
            phoneNumber: cleanPhone,
          },
        },
        update: { name },
        create: {
          phoneNumber: cleanPhone,
          name: name,
          organizationId: finalOrgId,
          unreadCount: 0,
        },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      this.chatGateway.emitContactUpdated(contact);
      return contact;
    } catch (error: unknown) {
      this.logger.error(
        'Error creando contacto manualmente',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  private async downloadWhatsappMedia(
    org: any,
    mediaId: string,
  ): Promise<string> {
    const decryptedToken = decrypt(org.whatsappToken);

    // 1. Obtener URL de descarga
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${mediaId}`,
      {
        headers: { Authorization: `Bearer ${decryptedToken}` },
      },
    );
    const mediaData = await response.json();

    if (!response.ok || !mediaData.url) {
      throw new Error(
        `Error obteniendo URL de media: ${mediaData.error?.message || 'URL no encontrada'}`,
      );
    }

    // 2. Descargar el archivo
    const fileResponse = await fetch(mediaData.url, {
      headers: { Authorization: `Bearer ${decryptedToken}` },
    });

    if (!fileResponse.ok) {
      throw new Error('Error descargando el archivo de los servidores de Meta');
    }

    const buffer = await fileResponse.arrayBuffer();
    const fileName = `${Date.now()}-${mediaId}.${mediaData.mime_type.split('/')[1]}`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

    fs.writeFileSync(filePath, Buffer.from(buffer));

    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    return `${baseUrl}/uploads/${fileName}`;
  }

  private async checkForTriggers(
    orgId: string,
    messageBody: string,
  ): Promise<any | null> {
    try {
      const messageLower = messageBody.toLowerCase();
      // Buscamos todos los disparadores activos de los productos de esta organización
      const triggers = await this.prisma.productTrigger.findMany({
        where: {
          Product: {
            organizationId: orgId,
            isActive: true,
          },
        },
      });

      // Buscamos si el mensaje del usuario contiene alguna palabra clave del disparador (búsqueda substring)
      for (const t of triggers) {
        if (messageLower.includes(t.keyword.toLowerCase())) {
          return t;
        }
      }
      return null;
    } catch (e) {
      this.logger.error('Error checking triggers:', e);
      return null;
    }
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
