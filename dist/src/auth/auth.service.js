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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
let AuthService = class AuthService {
    usersService;
    jwtService;
    prisma;
    constructor(usersService, jwtService, prisma) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    async validateUser(email, pass) {
        const user = await this.usersService.findOneByEmail(email);
        if (user && user.password && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(user) {
        const dbUser = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: {
                organizations: {
                    include: { Organization: true }
                }
            }
        });
        let orgs = [];
        if (dbUser?.globalRole === 'SUPER_ADMIN') {
            const allOrgs = await this.prisma.organization.findMany();
            orgs = allOrgs.map(o => ({
                id: o.id,
                name: o.name,
                role: 'super-admin'
            }));
        }
        else {
            orgs = dbUser?.organizations
                .filter(uo => uo.status === 'active')
                .map(uo => ({
                id: uo.organizationId,
                name: uo.Organization.name,
                role: uo.role
            })) || [];
        }
        let activeOrg = orgs.find(o => o.id === dbUser?.lastActiveOrganizationId) || orgs[0] || null;
        const payload = {
            sub: user.id,
            email: user.email,
            role: activeOrg?.role || 'user',
            orgId: activeOrg?.id || null,
            globalRole: dbUser?.globalRole || 'NONE'
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                activeRole: activeOrg?.role || 'user',
                activeOrganizationId: activeOrg?.id || null,
                globalRole: dbUser?.globalRole || 'NONE',
                organizations: orgs
            },
        };
    }
    async register(data) {
        const existing = await this.usersService.findOneByEmail(data.email);
        if (existing) {
            throw new common_1.ConflictException('El correo ya está registrado');
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const user = await this.usersService.create({
            email: data.email,
            password: hashedPassword,
            fullName: data.fullName,
        });
        return this.login(user);
    }
    async validateGoogleUser(profile) {
        const { id, emails, displayName, photos } = profile;
        const email = emails[0].value;
        let user = await this.usersService.findOneByEmail(email);
        if (!user) {
            const orgId = `org_${Math.random().toString(36).substring(7)}`;
            const org = await this.prisma.organization.create({
                data: {
                    id: orgId,
                    name: `Organización de ${displayName || email}`,
                    slug: orgId,
                },
            });
            user = await this.usersService.create({
                email,
                googleId: id,
                fullName: displayName,
                avatarUrl: photos?.[0]?.value,
                organizations: {
                    create: {
                        organizationId: org.id,
                        role: 'admin'
                    }
                }
            });
        }
        else if (!user.googleId) {
            user = await this.usersService.update(user.id, {
                googleId: id,
                avatarUrl: photos?.[0]?.value,
            });
        }
        return user;
    }
    async switchOrganization(userId, targetOrgId) {
        const dbUser = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                organizations: {
                    include: { Organization: true }
                }
            }
        });
        if (!dbUser)
            throw new common_1.UnauthorizedException('Usuario no encontrado');
        let membership = dbUser.organizations.find(uo => uo.organizationId === targetOrgId);
        let role = membership?.role || 'user';
        let targetOrgName = membership?.Organization.name;
        if (dbUser.globalRole === 'SUPER_ADMIN' && !membership) {
            const org = await this.prisma.organization.findUnique({ where: { id: targetOrgId } });
            if (!org)
                throw new common_1.UnauthorizedException('Organización no existe');
            role = 'super-admin';
            targetOrgName = org.name;
        }
        else if (!membership) {
            throw new common_1.UnauthorizedException('No perteneces a esta organización');
        }
        else if (membership.status === 'pending' && dbUser.globalRole !== 'SUPER_ADMIN') {
            throw new common_1.UnauthorizedException('Debes aceptar la invitación primero');
        }
        let orgs = [];
        if (dbUser.globalRole === 'SUPER_ADMIN') {
            const allOrgs = await this.prisma.organization.findMany();
            orgs = allOrgs.map(o => ({
                id: o.id,
                name: o.name,
                role: 'super-admin'
            }));
        }
        else {
            orgs = dbUser.organizations
                .filter(uo => uo.status === 'active')
                .map(uo => ({
                id: uo.organizationId,
                name: uo.Organization.name,
                role: uo.role
            }));
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { lastActiveOrganizationId: targetOrgId }
        });
        const payload = {
            sub: userId,
            email: dbUser.email,
            role: role,
            orgId: targetOrgId,
            globalRole: dbUser.globalRole
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: userId,
                email: dbUser.email,
                fullName: dbUser.fullName,
                activeRole: role,
                activeOrganizationId: targetOrgId,
                globalRole: dbUser.globalRole,
                organizations: orgs
            },
        };
    }
    async forceSeed() {
        const hashedPassword = await bcrypt.hash('password123', 10);
        const email = 'jhaddynortiz@gmail.com';
        const user = await this.prisma.user.upsert({
            where: { email },
            update: { globalRole: 'SUPER_ADMIN' },
            create: {
                email,
                password: hashedPassword,
                fullName: 'Jhaddyn Ortiz',
                globalRole: 'SUPER_ADMIN'
            },
        });
        await this.prisma.organization.upsert({
            where: { id: 'orizon' },
            update: {},
            create: {
                id: 'orizon',
                name: 'Orizon',
                slug: 'orizon',
                whatsappToken: this.encrypt('EAASAjefbk5ABRHD6epeHYcZAGqdoRBvo7jwK5AZAENZAimrUPZCMXSNLBxir9UfxPZAQRjFh4ZB2KIyrHiioQrTo1RKrJ8cAETeZAh48oKPvjC2XTUWYSe339SeQ1IE7MT6msN4oA2jGQZBqHQ1AdjqFdDGO4bGr3GqDpVjhAACXZCvt6V3I6OY3fe6QFyceTZC44tKi9BVHSh57grkXT0nxVVPzyaargUCVAiZAIEPQb8L'),
                whatsappPhoneId: '1108021955722585',
                openaiApiKey: this.encrypt('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'),
                whatsappVerifyToken: 'omnicore_secreto_2026',
            },
        });
        await this.prisma.organization.upsert({
            where: { id: 'camver' },
            update: {},
            create: {
                id: 'camver',
                name: 'Camver',
                slug: 'camver',
                whatsappToken: this.encrypt('EAAeNt4Hl6oABRH8BEoA1PClCeUTWQXSYotZATrbdYFPCmO8r0B4Ym7wR34qnGpyvrcWNWvY803YTWRNxspT8o9slje3ZB9xi4d7ueWBhRfPxFSp6FVNNo8WGi403lbAhxnrusOBkX3Kl4qukF7yx22oYRL5Av0mmGbMbhurZCovuycIzz70ZCiCW7kQjNWEZALgZDZD'),
                whatsappPhoneId: '998199260052404',
                openaiApiKey: this.encrypt('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'),
                whatsappVerifyToken: 'omnicore_secreto_2026',
            },
        });
        await this.prisma.userOrganization.upsert({
            where: { userId_organizationId: { userId: user.id, organizationId: 'orizon' } },
            update: { role: 'admin' },
            create: { userId: user.id, organizationId: 'orizon', role: 'admin' },
        });
        await this.prisma.userOrganization.upsert({
            where: { userId_organizationId: { userId: user.id, organizationId: 'camver' } },
            update: { role: 'admin' },
            create: { userId: user.id, organizationId: 'camver', role: 'admin' },
        });
        const usersToCreate = [
            { email: 'piromanojhadder@gmail.com', role: 'admin', org: 'orizon' },
            { email: 'maria@test.com', role: 'user', org: 'camver' }
        ];
        for (const u of usersToCreate) {
            const newUser = await this.prisma.user.upsert({
                where: { email: u.email },
                update: { globalRole: 'NONE' },
                create: {
                    email: u.email,
                    password: hashedPassword,
                    fullName: u.email.split('@')[0],
                    globalRole: 'NONE'
                }
            });
            await this.prisma.userOrganization.upsert({
                where: { userId_organizationId: { userId: newUser.id, organizationId: u.org } },
                update: { role: u.role },
                create: {
                    userId: newUser.id,
                    organizationId: u.org,
                    role: u.role,
                }
            });
        }
        return { success: true, message: 'Seeding completado con Global Roles.' };
    }
    async clearChats() {
        const deletedMessages = await this.prisma.message.deleteMany({});
        const deletedContacts = await this.prisma.contact.deleteMany({});
        return {
            success: true,
            message: `Eliminados ${deletedMessages.count} mensajes y ${deletedContacts.count} contactos.`
        };
    }
    async migrateContacts() {
        const OLD_ORG_ID = '359b8d14-5cbb-47bc-93a1-052bb9f59e2d';
        const NEW_ORG_ID = 'orizon';
        const contactsBefore = await this.prisma.contact.count({
            where: { organizationId: OLD_ORG_ID }
        });
        if (contactsBefore === 0) {
            return { success: true, message: 'No hay contactos para migrar.' };
        }
        const result = await this.prisma.contact.updateMany({
            where: { organizationId: OLD_ORG_ID },
            data: { organizationId: NEW_ORG_ID }
        });
        return {
            success: true,
            message: `Migrados ${result.count} contactos de OmniCore Demo → Orizon.`
        };
    }
    encrypt(text) {
        const ALGORITHM = 'aes-256-cbc';
        const ENCRYPTION_KEY = process.env.CRYPTO_KEY || 'omnicore_secure_32_byte_key_auth';
        const IV_LENGTH = 16;
        if (!text)
            return text;
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map