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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductsService = class ProductsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(organizationId, filters) {
        const where = { organizationId };
        if (filters?.subcategoryId) {
            where.subcategoryId = filters.subcategoryId;
        }
        else if (filters?.categoryId) {
            where.Subcategory = { categoryId: filters.categoryId };
        }
        if (filters?.search) {
            where.name = { contains: filters.search, mode: 'insensitive' };
        }
        return this.prisma.product.findMany({
            where,
            include: {
                Subcategory: {
                    include: { Category: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id, organizationId) {
        const product = await this.prisma.product.findFirst({
            where: { id, organizationId },
            include: {
                Subcategory: {
                    include: { Category: true }
                }
            },
        });
        if (!product)
            throw new common_1.NotFoundException('Producto no encontrado');
        return product;
    }
    async create(organizationId, data) {
        const { id, ...createData } = data;
        return this.prisma.product.create({
            data: {
                ...createData,
                organizationId,
            },
        });
    }
    async update(id, organizationId, data) {
        await this.findOne(id, organizationId);
        return this.prisma.product.update({
            where: { id },
            data,
        });
    }
    async remove(id, organizationId) {
        await this.findOne(id, organizationId);
        return this.prisma.product.delete({
            where: { id },
        });
    }
    async findAllActiveForGpt(organizationId) {
        return this.prisma.product.findMany({
            where: { organizationId, isActive: true },
            include: {
                Subcategory: {
                    include: { Category: true }
                }
            },
            orderBy: [
                { Subcategory: { Category: { name: 'asc' } } },
                { Subcategory: { name: 'asc' } },
                { name: 'asc' }
            ]
        });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductsService);
//# sourceMappingURL=products.service.js.map