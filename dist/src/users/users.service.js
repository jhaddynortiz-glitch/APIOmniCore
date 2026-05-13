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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOneByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: {
                organizations: {
                    include: { Organization: true }
                }
            },
        });
    }
    async findOneById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            include: {
                organizations: {
                    include: { Organization: true }
                }
            },
        });
    }
    async create(data) {
        return this.prisma.user.create({
            data,
        });
    }
    async update(id, data) {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }
    async checkUserExists(email) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, fullName: true, globalRole: true }
        });
        return { exists: !!user, user };
    }
    async addUserToOrganization(email, role, organizationId) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new common_1.NotFoundException('Este usuario no está registrado en la plataforma. Debe registrarse primero.');
        }
        if (user.globalRole === 'SUPER_ADMIN') {
            throw new common_1.ConflictException('No se puede invitar a un Super Admin a una organización, ya tienen acceso total.');
        }
        const existing = await this.prisma.userOrganization.findUnique({
            where: {
                userId_organizationId: {
                    userId: user.id,
                    organizationId
                }
            }
        });
        if (existing) {
            throw new common_1.ConflictException('Este usuario ya pertenece a esta organización.');
        }
        const membership = await this.prisma.userOrganization.create({
            data: {
                userId: user.id,
                organizationId,
                role,
                status: 'pending'
            },
            include: {
                User: { select: { id: true, email: true, fullName: true } },
                Organization: { select: { name: true } }
            }
        });
        return membership;
    }
    async updateOrgMember(userId, organizationId, data) {
        const membership = await this.prisma.userOrganization.findUnique({
            where: {
                userId_organizationId: { userId, organizationId }
            }
        });
        if (!membership) {
            throw new common_1.NotFoundException('Miembro no encontrado en la organización.');
        }
        return this.prisma.userOrganization.update({
            where: {
                userId_organizationId: { userId, organizationId }
            },
            data: {
                ...(data.role && { role: data.role }),
                ...(data.status && { status: data.status })
            },
            include: {
                User: { select: { id: true, email: true, fullName: true } }
            }
        });
    }
    async removeOrgMember(userId, organizationId) {
        const membership = await this.prisma.userOrganization.findUnique({
            where: {
                userId_organizationId: { userId, organizationId }
            }
        });
        if (!membership) {
            throw new common_1.NotFoundException('Miembro no encontrado en la organización.');
        }
        return this.prisma.userOrganization.delete({
            where: {
                userId_organizationId: { userId, organizationId }
            }
        });
    }
    async getOrgMembers(organizationId) {
        return this.prisma.userOrganization.findMany({
            where: {
                organizationId,
                User: {
                    globalRole: { not: 'SUPER_ADMIN' }
                }
            },
            include: {
                User: { select: { id: true, email: true, fullName: true, avatarUrl: true, globalRole: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getMyInvitations(userId) {
        return this.prisma.userOrganization.findMany({
            where: { userId, status: 'pending' },
            include: {
                Organization: { select: { id: true, name: true, slug: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async acceptInvitation(userId, organizationId) {
        const membership = await this.prisma.userOrganization.findUnique({
            where: {
                userId_organizationId: { userId, organizationId }
            }
        });
        if (!membership) {
            throw new common_1.NotFoundException('Invitación no encontrada.');
        }
        if (membership.status === 'active') {
            throw new common_1.ConflictException('Ya eres miembro activo de esta organización.');
        }
        return this.prisma.userOrganization.update({
            where: {
                userId_organizationId: { userId, organizationId }
            },
            data: { status: 'active' },
            include: {
                Organization: { select: { id: true, name: true } }
            }
        });
    }
    async getMyMemberships(userId) {
        return this.prisma.userOrganization.findMany({
            where: { userId },
            include: {
                Organization: { select: { id: true, name: true, slug: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getAllPlatformOrganizations() {
        return this.prisma.organization.findMany({
            include: {
                _count: {
                    select: { users: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map