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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WhatsappController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappController = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_service_1 = require("./whatsapp.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let WhatsappController = WhatsappController_1 = class WhatsappController {
    whatsappService;
    logger = new common_1.Logger(WhatsappController_1.name);
    constructor(whatsappService) {
        this.whatsappService = whatsappService;
    }
    async verifyWebhook(mode, token, challenge) {
        if (mode !== 'subscribe') {
            throw new common_1.HttpException('Modo inválido', common_1.HttpStatus.FORBIDDEN);
        }
        const isValid = await this.whatsappService.verifyWebhookToken(token);
        if (isValid) {
            this.logger.log('✅ Webhook verificado por Meta!');
            return challenge;
        }
        throw new common_1.HttpException('Token invalido', common_1.HttpStatus.FORBIDDEN);
    }
    async handleWebhook(body) {
        this.logger.log('📩 Webhook recibido desde Meta');
        try {
            await this.whatsappService.processWebhook(body);
            return { status: 'success', message: 'Webhook procesado correctamente' };
        }
        catch (error) {
            this.logger.error('❌ Error procesando webhook:', error.message);
            throw new common_1.HttpException('Error interno procesando webhook', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getContacts(req) {
        return await this.whatsappService.getContacts(req.user.orgId);
    }
    async createContact(req, name, phoneNumber) {
        return await this.whatsappService.createContact(name, phoneNumber, req.user.orgId);
    }
    async getMessages(contactId, limit, cursor) {
        return await this.whatsappService.getMessages(contactId, limit, cursor);
    }
    async sendMessage(contactId, text, type, mediaUrl) {
        return await this.whatsappService.sendMessage(contactId, text, type, mediaUrl);
    }
    async markAsRead(contactId) {
        return await this.whatsappService.markContactAsRead(contactId);
    }
};
exports.WhatsappController = WhatsappController;
__decorate([
    (0, common_1.Get)('webhook'),
    __param(0, (0, common_1.Query)('hub.mode')),
    __param(1, (0, common_1.Query)('hub.verify_token')),
    __param(2, (0, common_1.Query)('hub.challenge')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "verifyWebhook", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('contacts'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "getContacts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('contacts'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('name')),
    __param(2, (0, common_1.Body)('phoneNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "createContact", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('messages/:contactId'),
    __param(0, (0, common_1.Param)('contactId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('cursor')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, String]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "getMessages", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('messages/:contactId'),
    __param(0, (0, common_1.Param)('contactId')),
    __param(1, (0, common_1.Body)('text')),
    __param(2, (0, common_1.Body)('type')),
    __param(3, (0, common_1.Body)('mediaUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('contacts/:contactId/read'),
    __param(0, (0, common_1.Param)('contactId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "markAsRead", null);
exports.WhatsappController = WhatsappController = WhatsappController_1 = __decorate([
    (0, common_1.Controller)('whatsapp'),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService])
], WhatsappController);
//# sourceMappingURL=whatsapp.controller.js.map