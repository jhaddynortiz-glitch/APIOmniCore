"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const crypto_util_1 = require("../common/utils/crypto.util");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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
    async verifyWebhookToken(token) {
        const org = await this.prisma.organization.findFirst({
            where: { whatsappVerifyToken: token }
        });
        return !!org;
    }
    async processWebhook(body) {
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
                else {
                    this.logger.debug('ℹ️ Webhook recibido sin mensajes ni estados:', JSON.stringify(body));
                }
                return;
            }
            if (message.id) {
                const existingMessage = await this.prisma.message.findUnique({
                    where: { id: message.id }
                });
                if (existingMessage) {
                    this.logger.warn(`⚠️ Webhook duplicado ignorado. Mensaje ya procesado: ${message.id}`);
                    return;
                }
            }
            const phoneId = metadata?.phone_number_id;
            let org = await this.prisma.organization.findFirst({
                where: { whatsappPhoneId: phoneId }
            });
            if (!org) {
                this.logger.warn(`⚠️ Phone ID ${phoneId} no coincide. Usando fallback de la primera organización.`);
                org = await this.prisma.organization.findFirst();
            }
            if (!org) {
                this.logger.error(`❌ No se encontró ninguna organización para procesar el mensaje.`);
                return;
            }
            const phoneNumber = message.from;
            const messageType = message.type;
            const bodyText = message.text?.body;
            const location = message.location;
            this.logger.log(`🔍 [${org.name}] Procesando mensaje de ${phoneNumber}. Tipo: ${messageType}`);
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
            }
            const createdMessage = await this.prisma.message.create({
                data: {
                    id: message.id,
                    body: savedBody,
                    isFromMe: false,
                    type: messageTypeForDb,
                    contactId: contact.id
                }
            });
            this.chatGateway.emitNewMessage(createdMessage);
            if (messageType === 'location' && location) {
                this.autoReplyWithLocation(org.id, contact.id, location.latitude, location.longitude).catch(err => {
                    this.logger.error('Error en auto-reply de ubicación', err.message);
                });
            }
            else if (messageType === 'image') {
                const image = message.image;
                const mediaId = image.id;
                const caption = image.caption || '';
                try {
                    const mediaUrl = await this.downloadWhatsappMedia(org, mediaId);
                    savedBody = caption || '📷 Imagen';
                    messageTypeForDb = 'image';
                    const createdMessage = await this.prisma.message.create({
                        data: {
                            id: message.id,
                            body: savedBody,
                            mediaUrl: mediaUrl,
                            mimeType: image.mime_type,
                            isFromMe: false,
                            type: messageTypeForDb,
                            contactId: contact.id
                        }
                    });
                    this.chatGateway.emitNewMessage(createdMessage);
                    return createdMessage;
                }
                catch (err) {
                    this.logger.error('Error procesando imagen de WhatsApp', err.message);
                }
            }
            else if (savedBody) {
                this.autoReplyWithGpt(org.id, contact.id, savedBody).catch(err => {
                    this.logger.error('Error en auto-reply GPT', err.message);
                });
            }
            return createdMessage;
        }
        catch (error) {
            this.logger.error('Error procesando webhook de WhatsApp', error);
            throw error;
        }
    }
    async getContacts(organizationId) {
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
        }
        catch (error) {
            this.logger.error('Error obteniendo contactos', error.stack);
            throw error;
        }
    }
    async getMessages(contactId, limit = 50, cursor) {
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
    async sendMessage(contactId, bodyText, type = 'text', mediaUrl) {
        try {
            const contact = await this.prisma.contact.findUnique({
                where: { id: contactId },
                include: { Organization: true }
            });
            if (!contact)
                throw new common_1.NotFoundException('Contacto no encontrado');
            const org = contact.Organization;
            if (!org.whatsappToken || !org.whatsappPhoneId) {
                throw new Error(`La organización ${org.name} no tiene configuradas sus credenciales de WhatsApp`);
            }
            const decryptedToken = (0, crypto_util_1.decrypt)(org.whatsappToken);
            const url = `https://graph.facebook.com/v19.0/${org.whatsappPhoneId}/messages`;
            const payload = {
                messaging_product: 'whatsapp',
                to: contact.phoneNumber,
                type: type,
            };
            if (type === 'text') {
                payload.text = { body: bodyText };
            }
            else if (type === 'image') {
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
        }
        catch (error) {
            this.logger.error(`Error enviando mensaje a contacto ${contactId}`, error.stack);
            throw error;
        }
    }
    async autoReplyWithGpt(orgId, contactId, userMessage) {
        const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
        if (!org?.openaiApiKey)
            return;
        const decryptedApiKey = (0, crypto_util_1.decrypt)(org.openaiApiKey);
        const { text, imageUrls } = await this.gptService.generateReply(contactId, userMessage, decryptedApiKey, orgId);
        const apiUrl = process.env.API_URL || 'http://localhost:3000';
        for (let url of imageUrls) {
            const baseUrl = process.env.API_URL || 'http://localhost:3000';
            if (url.includes('localhost:3000')) {
                url = url.replace('localhost:3000', baseUrl.replace('http://', '').replace('https://', ''));
            }
            try {
                await this.sendMessage(contactId, '', 'image', url);
            }
            catch (imgError) {
                this.logger.error(`❌ Fallo al enviar imagen a WhatsApp: ${imgError.message}`);
            }
        }
        await this.sendMessage(contactId, text);
    }
    async autoReplyWithLocation(orgId, contactId, lat, lng) {
        const distanceKm = this.calculateDistance(this.DELIVERY_CENTER.lat, this.DELIVERY_CENTER.lng, lat, lng);
        const isInRange = distanceKm <= this.DELIVERY_CENTER.radiusKm;
        const locationContext = isInRange
            ? `[SISTEMA: El cliente está a ${distanceKm.toFixed(1)} km. SÍ hay cobertura. Procesa el pedido.]`
            : `[SISTEMA: El cliente está a ${distanceKm.toFixed(1)} km. NO hay cobertura. Sugiere recojo en tienda.]`;
        const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
        const decryptedApiKey = org?.openaiApiKey ? (0, crypto_util_1.decrypt)(org.openaiApiKey) : undefined;
        const { text } = await this.gptService.generateReply(contactId, locationContext, decryptedApiKey, orgId);
        await this.sendMessage(contactId, text);
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
            this.logger.error(`Error marcando como leído a ${contactId}`, error.stack);
            throw error;
        }
    }
    async createContact(name, phoneNumber, organizationId) {
        try {
            let finalOrgId = organizationId;
            if (!finalOrgId) {
                const org = await this.prisma.organization.findFirst();
                if (!org)
                    throw new Error('No se encontró ninguna organización');
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
        }
        catch (error) {
            this.logger.error('Error creando contacto manualmente', error.stack);
            throw error;
        }
    }
    async downloadWhatsappMedia(org, mediaId) {
        const decryptedToken = (0, crypto_util_1.decrypt)(org.whatsappToken);
        const response = await fetch(`https://graph.facebook.com/v19.0/${mediaId}`, {
            headers: { 'Authorization': `Bearer ${decryptedToken}` }
        });
        const mediaData = await response.json();
        if (!response.ok || !mediaData.url) {
            throw new Error(`Error obteniendo URL de media: ${mediaData.error?.message || 'URL no encontrada'}`);
        }
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
        const baseUrl = process.env.API_URL || 'http://localhost:3000';
        return `${baseUrl}/uploads/${fileName}`;
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