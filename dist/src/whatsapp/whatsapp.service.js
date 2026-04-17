"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WhatsappService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const chat_gateway_1 = require("../websockets/chat.gateway");
const gpt_service_1 = require("../gpt/gpt.service");
let WhatsappService = WhatsappService_1 = class WhatsappService {
    prisma;
    chatGateway;
    gptService;
    logger = new common_1.Logger(WhatsappService_1.name);
    DELIVERY_CENTER = {
        lat: -17.392774,
        lng: -66.158748,
        radiusKm: 5,
    };
    constructor(prisma, chatGateway, gptService) {
        this.prisma = prisma;
        this.chatGateway = chatGateway;
        this.gptService = gptService;
    }
    async processWebhook(body) {
        try {
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;
            const message = value?.messages?.[0];
            if (!message) {
                return;
            }
            const phoneNumber = message.from;
            const messageType = message.type;
            const bodyText = message.text?.body;
            const location = message.location;
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
            let savedBody = bodyText || '';
            let messageTypeForDb = 'text';
            if (messageType === 'location' && location) {
                savedBody = `📍 Ubicación: ${location.latitude}, ${location.longitude}`;
                if (location.name)
                    savedBody += ` (${location.name})`;
                messageTypeForDb = 'location';
                this.logger.log(`📍 Ubicación recibida: lat=${location.latitude}, lng=${location.longitude}`);
            }
            const createdMessage = await this.prisma.message.create({
                data: {
                    body: savedBody,
                    isFromMe: false,
                    type: messageTypeForDb,
                    contactId: contact.id
                }
            });
            this.logger.log(`✅ Mensaje guardado en BD. Contacto: ${contact.phoneNumber}, Tipo: ${messageTypeForDb}`);
            this.chatGateway.emitNewMessage(createdMessage);
            if (messageType === 'location' && location) {
                this.autoReplyWithLocation(contact.id, location.latitude, location.longitude).catch(err => {
                    this.logger.error('Error en auto-reply de ubicación (no bloqueante)', err.message);
                });
            }
            else if (savedBody) {
                this.autoReplyWithGpt(contact.id, savedBody).catch(err => {
                    this.logger.error('Error en auto-reply GPT (no bloqueante)', err.message);
                });
            }
            return createdMessage;
        }
        catch (error) {
            this.logger.error('Error procesando webhook de WhatsApp', error);
            throw error;
        }
    }
    async getContacts() {
        try {
            const org = await this.prisma.organization.findFirst();
            if (!org)
                return [];
            const contacts = await this.prisma.contact.findMany({
                where: { organizationId: org.id },
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
        }
        catch (error) {
            this.logger.error('Error obteniendo contactos', error.stack, WhatsappService_1.name);
            throw error;
        }
    }
    async getMessages(contactId, limit = 50, cursor) {
        try {
            const options = {
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
        catch (error) {
            this.logger.error(`Error obteniendo mensajes para contacto ${contactId}`, error.stack, WhatsappService_1.name);
            throw error;
        }
    }
    async sendMessage(contactId, bodyText) {
        try {
            const contact = await this.prisma.contact.findUnique({
                where: { id: contactId }
            });
            if (!contact)
                throw new Error('Contacto no encontrado');
            const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
            const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
            if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
                throw new Error('Variables WHATSAPP_TOKEN o WHATSAPP_PHONE_ID no configuradas en .env');
            }
            const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`;
            const payload = {
                messaging_product: 'whatsapp',
                to: contact.phoneNumber,
                type: 'text',
                text: { body: bodyText }
            };
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
            const createdMessage = await this.prisma.message.create({
                data: {
                    body: bodyText,
                    isFromMe: true,
                    type: 'text',
                    contactId: contactId,
                },
            });
            this.chatGateway.emitNewMessage(createdMessage);
            this.logger.log(`✅ Mensaje ENVIADO REAL y guardado. Hacia: ${contact.phoneNumber}`);
            return createdMessage;
        }
        catch (error) {
            this.logger.error(`Error de red o de DB enviando a Contacto ${contactId}`, error.stack, WhatsappService_1.name);
            throw error;
        }
    }
    async markContactAsRead(contactId) {
        try {
            await this.prisma.contact.update({
                where: { id: contactId },
                data: { unreadCount: 0 }
            });
            this.logger.log(`👁️ Chat marcado como leído: ${contactId}`);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`Error marcando como leído a ${contactId}`, error.stack, WhatsappService_1.name);
            throw error;
        }
    }
    async createContact(name, phoneNumber) {
        try {
            let org = await this.prisma.organization.findFirst();
            if (!org)
                throw new Error('No se encontró ninguna organización');
            const cleanPhone = phoneNumber.replace(/\D/g, '');
            const contact = await this.prisma.contact.upsert({
                where: {
                    organizationId_phoneNumber: {
                        organizationId: org.id,
                        phoneNumber: cleanPhone
                    }
                },
                update: {
                    name: name
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
            this.chatGateway.emitContactUpdated(contact);
            return contact;
        }
        catch (error) {
            this.logger.error('Error creando contacto manualmente', error.stack, WhatsappService_1.name);
            throw error;
        }
    }
    async autoReplyWithGpt(contactId, userMessage) {
        this.logger.log(`🤖 Generando respuesta automática con GPT para contacto: ${contactId}`);
        const gptReply = await this.gptService.generateReply(contactId, userMessage);
        await this.sendMessage(contactId, gptReply);
        this.logger.log(`🤖 Respuesta GPT enviada exitosamente a contacto: ${contactId}`);
    }
    async autoReplyWithLocation(contactId, lat, lng) {
        const distanceKm = this.calculateDistance(this.DELIVERY_CENTER.lat, this.DELIVERY_CENTER.lng, lat, lng);
        const isInRange = distanceKm <= this.DELIVERY_CENTER.radiusKm;
        this.logger.log(`📍 Distancia calculada: ${distanceKm.toFixed(2)} km — ${isInRange ? 'DENTRO' : 'FUERA'} del rango (${this.DELIVERY_CENTER.radiusKm} km)`);
        const locationContext = isInRange
            ? `[SISTEMA: El cliente envió su ubicación. Está a ${distanceKm.toFixed(1)} km del centro de entrega. SÍ está dentro del rango de cobertura (${this.DELIVERY_CENTER.radiusKm} km). Confirma que puedes hacer la entrega a domicilio y continúa cerrando la venta.]`
            : `[SISTEMA: El cliente envió su ubicación. Está a ${distanceKm.toFixed(1)} km del centro de entrega. NO está dentro del rango de cobertura (${this.DELIVERY_CENTER.radiusKm} km). Informa amablemente que no llegas a esa zona y sugiere la opción de recoger en el punto de la ciudad (calle Ayacucho, frente a correos).]`;
        const gptReply = await this.gptService.generateReply(contactId, locationContext);
        await this.sendMessage(contactId, gptReply);
        this.logger.log(`📍 Respuesta de cobertura enviada a contacto: ${contactId}`);
    }
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = this.toRad(lat2 - lat1);
        const dLng = this.toRad(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    toRad(deg) {
        return deg * (Math.PI / 180);
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = WhatsappService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        chat_gateway_1.ChatGateway,
        gpt_service_1.GptService])
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map