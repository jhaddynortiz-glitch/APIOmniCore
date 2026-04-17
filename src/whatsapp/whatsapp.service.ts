import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../websockets/chat.gateway';
import { GptService } from '../gpt/gpt.service';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  // Centro de entrega: Cochabamba, Calle Ayacucho (frente a correos)
  // Puedes ajustar estas coordenadas y el radio según tu zona real
  private readonly DELIVERY_CENTER = {
    lat: -17.392774,
    lng: -66.158748,
    radiusKm: 5, // Radio de cobertura en kilómetros
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly chatGateway: ChatGateway,
    private readonly gptService: GptService
  ) { }

  async processWebhook(body: any) {
    try {
      // Extracción simulada de la estructura de WhatsApp
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      if (!message) {
        return; // No es un mensaje
      }

      const phoneNumber = message.from;
      const messageType = message.type; // 'text', 'location', 'image', etc.
      const bodyText = message.text?.body;
      const location = message.location; // { latitude, longitude, name?, address? }

      // 1. Obtener la organización por defecto (para desarrollo). 
      // En producción, esto vendría del número receptor.
      let org = await this.prisma.organization.findFirst();
      if (!org) {
        org = await this.prisma.organization.create({
          data: {
            id: 'org_dev_123',
            name: 'Organización Dev',
            slug: 'org-dev'
          }
        });
      }

      // 2. Buscar o crear el contacto
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

      // 3. Determinar el contenido del mensaje según su tipo
      let savedBody = bodyText || '';
      let messageTypeForDb = 'text';

      if (messageType === 'location' && location) {
        // El usuario envió su ubicación
        savedBody = `📍 Ubicación: ${location.latitude}, ${location.longitude}`;
        if (location.name) savedBody += ` (${location.name})`;
        messageTypeForDb = 'location';
        this.logger.log(`📍 Ubicación recibida: lat=${location.latitude}, lng=${location.longitude}`);
      }

      // 4. Crear el mensaje en la BD
      const createdMessage = await this.prisma.message.create({
        data: {
          body: savedBody,
          isFromMe: false,
          type: messageTypeForDb,
          contactId: contact.id
        }
      });

      this.logger.log(`✅ Mensaje guardado en BD. Contacto: ${contact.phoneNumber}, Tipo: ${messageTypeForDb}`);

      // 5. Emitir el evento en tiempo real a Angular
      this.chatGateway.emitNewMessage(createdMessage);

      // 6. Respuesta automática con ChatGPT (en background)
      if (messageType === 'location' && location) {
        // Caso especial: ubicación → verificar cobertura y responder
        this.autoReplyWithLocation(contact.id, location.latitude, location.longitude).catch(err => {
          this.logger.error('Error en auto-reply de ubicación (no bloqueante)', err.message);
        });
      } else if (savedBody) {
        this.autoReplyWithGpt(contact.id, savedBody).catch(err => {
          this.logger.error('Error en auto-reply GPT (no bloqueante)', err.message);
        });
      }

      return createdMessage;
    } catch (error) {
      this.logger.error('Error procesando webhook de WhatsApp', error);
      throw error;
    }
  }
  async getContacts() {
    try {
      const org = await this.prisma.organization.findFirst();
      if (!org) return [];

      // Retornar los contactos de esa organización con su último mensaje (ideal para lista de chats)
      const contacts = await this.prisma.contact.findMany({
        where: { organizationId: org.id },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      // Prisma no permite ordenar directamente por un sub-elemento "many", 
      // así que lo ordenamos ágilmente en memoria de forma descendiente (el más reciente arriba)
      return contacts.sort((a, b) => {
        const dateA = a.messages[0]?.createdAt ? new Date(a.messages[0].createdAt).getTime() : new Date(a.createdAt).getTime();
        const dateB = b.messages[0]?.createdAt ? new Date(b.messages[0].createdAt).getTime() : new Date(b.createdAt).getTime();
        return dateB - dateA; // Descendente
      });
    } catch (error) {
      this.logger.error('Error obteniendo contactos', error.stack, WhatsappService.name);
      throw error;
    }
  }

  async getMessages(contactId: string, limit: number = 50, cursor?: string) {
    try {
      const options: any = {
        where: { contactId },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
      };

      if (cursor) {
        options.cursor = { id: cursor };
        options.skip = 1; // Saltar el cursor actual
      }

      // Retornar mensajes más recientes primero para paginación, 
      // pero revertimos al final para que el frontend los vea cronológicamente.
      const messages = await this.prisma.message.findMany(options);
      return messages.reverse();
    } catch (error) {
      this.logger.error(`Error obteniendo mensajes para contacto ${contactId}`, error.stack, WhatsappService.name);
      throw error;
    }
  }

  async sendMessage(contactId: string, bodyText: string) {
    try {
      // 1. Obtener el número de teléfono del destino
      const contact = await this.prisma.contact.findUnique({
        where: { id: contactId }
      });
      if (!contact) throw new Error('Contacto no encontrado');

      const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
      const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

      if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
        throw new Error('Variables WHATSAPP_TOKEN o WHATSAPP_PHONE_ID no configuradas en .env');
      }

      // 2. Apuntar a la nube de WhatsApp (Meta Graph API)
      const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`;
      const payload = {
        messaging_product: 'whatsapp',
        to: contact.phoneNumber,
        type: 'text',
        text: { body: bodyText }
      };

      // 3. Ejecutar el envío HTTP real
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const metaData = await response.json();

      if (!response.ok) {
        this.logger.error('Error desde Meta API', metaData);
        throw new Error(`La API de Meta rechazó el envío: ${metaData.error?.message}`);
      }

      // 4. Guardar copia en nuestra Base de Datos (solo si WhatsApp lo aceptó)
      const createdMessage = await this.prisma.message.create({
        data: {
          body: bodyText,
          isFromMe: true,
          type: 'text',
          contactId: contactId,
        },
      });

      // 5. Emitir por WebSocket para que Angular actualice la lista de contactos en tiempo real
      this.chatGateway.emitNewMessage(createdMessage);

      this.logger.log(`✅ Mensaje ENVIADO REAL y guardado. Hacia: ${contact.phoneNumber}`);
      return createdMessage;
    } catch (error) {
      this.logger.error(`Error de red o de DB enviando a Contacto ${contactId}`, error.stack, WhatsappService.name);
      throw error;
    }
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
      this.logger.error(`Error marcando como leído a ${contactId}`, error.stack, WhatsappService.name);
      throw error;
    }
  }

  async createContact(name: string, phoneNumber: string) {
    try {
      let org = await this.prisma.organization.findFirst();
      if (!org) throw new Error('No se encontró ninguna organización');

      // Limpiar el número de teléfono (solo dígitos)
      const cleanPhone = phoneNumber.replace(/\D/g, '');

      const contact = await this.prisma.contact.upsert({
        where: {
          organizationId_phoneNumber: {
            organizationId: org.id,
            phoneNumber: cleanPhone
          }
        },
        update: {
          name: name // Actualizamos el nombre si ya existía
        },
        create: {
          phoneNumber: cleanPhone,
          name: name,
          organizationId: org.id,
          unreadCount: 0
        },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });

      this.logger.log(`👤 Contacto creado/recuperado: ${contact.name} (${contact.phoneNumber})`);
      
      // Emitir actualización vía WebSocket para sincronización multi-dispositivo
      this.chatGateway.emitContactUpdated(contact);

      return contact;
    } catch (error) {
      this.logger.error('Error creando contacto manualmente', error.stack, WhatsappService.name);
      throw error;
    }
  }

  /**
   * Genera una respuesta con ChatGPT y la envía automáticamente al cliente por WhatsApp.
   */
  private async autoReplyWithGpt(contactId: string, userMessage: string) {
    this.logger.log(`🤖 Generando respuesta automática con GPT para contacto: ${contactId}`);

    const gptReply = await this.gptService.generateReply(contactId, userMessage);
    await this.sendMessage(contactId, gptReply);

    this.logger.log(`🤖 Respuesta GPT enviada exitosamente a contacto: ${contactId}`);
  }

  /**
   * Procesa la ubicación del usuario, verifica cobertura de entrega,
   * y le pasa el resultado a ChatGPT para que responda naturalmente.
   */
  private async autoReplyWithLocation(contactId: string, lat: number, lng: number) {
    const distanceKm = this.calculateDistance(
      this.DELIVERY_CENTER.lat,
      this.DELIVERY_CENTER.lng,
      lat,
      lng
    );

    const isInRange = distanceKm <= this.DELIVERY_CENTER.radiusKm;

    this.logger.log(`📍 Distancia calculada: ${distanceKm.toFixed(2)} km — ${isInRange ? 'DENTRO' : 'FUERA'} del rango (${this.DELIVERY_CENTER.radiusKm} km)`);

    // Construimos un mensaje de contexto para que GPT responda de forma natural
    const locationContext = isInRange
      ? `[SISTEMA: El cliente envió su ubicación. Está a ${distanceKm.toFixed(1)} km del centro de entrega. SÍ está dentro del rango de cobertura (${this.DELIVERY_CENTER.radiusKm} km). Confirma que puedes hacer la entrega a domicilio y continúa cerrando la venta.]`
      : `[SISTEMA: El cliente envió su ubicación. Está a ${distanceKm.toFixed(1)} km del centro de entrega. NO está dentro del rango de cobertura (${this.DELIVERY_CENTER.radiusKm} km). Informa amablemente que no llegas a esa zona y sugiere la opción de recoger en el punto de la ciudad (calle Ayacucho, frente a correos).]`;

    const gptReply = await this.gptService.generateReply(contactId, locationContext);
    await this.sendMessage(contactId, gptReply);

    this.logger.log(`📍 Respuesta de cobertura enviada a contacto: ${contactId}`);
  }

  /**
   * Calcula la distancia entre dos puntos geográficos usando la fórmula de Haversine.
   * @returns Distancia en kilómetros
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

}
