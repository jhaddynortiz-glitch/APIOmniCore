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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PromptsService = class PromptsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(organizationId) {
        return this.prisma.prompt.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, organizationId) {
        const prompt = await this.prisma.prompt.findFirst({
            where: { id, organizationId },
        });
        if (!prompt)
            throw new common_1.NotFoundException('Prompt no encontrado');
        return prompt;
    }
    async create(organizationId, data) {
        if (data.isActive) {
            await this.prisma.prompt.updateMany({
                where: { organizationId, isActive: true },
                data: { isActive: false },
            });
        }
        const { id, ...createData } = data;
        return this.prisma.prompt.create({
            data: {
                ...createData,
                organizationId,
            },
        });
    }
    async update(id, organizationId, data) {
        await this.findOne(id, organizationId);
        if (data.isActive) {
            await this.prisma.prompt.updateMany({
                where: { organizationId, isActive: true, NOT: { id } },
                data: { isActive: false },
            });
        }
        return this.prisma.prompt.update({
            where: { id },
            data,
        });
    }
    async remove(id, organizationId) {
        await this.findOne(id, organizationId);
        return this.prisma.prompt.delete({
            where: { id },
        });
    }
    async getActivePrompt(organizationId) {
        return this.prisma.prompt.findFirst({
            where: { organizationId, isActive: true },
        });
    }
};
exports.PromptsService = PromptsService;
exports.PromptsService = PromptsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PromptsService);
//# sourceMappingURL=prompts.service.js.map