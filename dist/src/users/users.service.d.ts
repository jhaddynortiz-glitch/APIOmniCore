import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOneByEmail(email: string): Promise<any | null>;
    findOneById(id: string): Promise<any | null>;
    create(data: Prisma.UserCreateInput): Promise<User>;
    update(id: string, data: Prisma.UserUpdateInput): Promise<User>;
    checkUserExists(email: string): Promise<{
        exists: boolean;
        user: {
            id: string;
            email: string;
            fullName: string | null;
            globalRole: string;
        } | null;
    }>;
    addUserToOrganization(email: string, role: string, organizationId: string): Promise<any>;
    updateOrgMember(userId: string, organizationId: string, data: {
        role?: string;
        status?: string;
    }): Promise<{
        User: {
            id: string;
            email: string;
            fullName: string | null;
        };
    } & {
        organizationId: string;
        createdAt: Date;
        role: string;
        userId: string;
        status: string;
    }>;
    removeOrgMember(userId: string, organizationId: string): Promise<{
        organizationId: string;
        createdAt: Date;
        role: string;
        userId: string;
        status: string;
    }>;
    getOrgMembers(organizationId: string): Promise<({
        User: {
            id: string;
            email: string;
            fullName: string | null;
            avatarUrl: string | null;
            globalRole: string;
        };
    } & {
        organizationId: string;
        createdAt: Date;
        role: string;
        userId: string;
        status: string;
    })[]>;
    getMyInvitations(userId: string): Promise<({
        Organization: {
            id: string;
            name: string;
            slug: string;
        };
    } & {
        organizationId: string;
        createdAt: Date;
        role: string;
        userId: string;
        status: string;
    })[]>;
    acceptInvitation(userId: string, organizationId: string): Promise<{
        Organization: {
            id: string;
            name: string;
        };
    } & {
        organizationId: string;
        createdAt: Date;
        role: string;
        userId: string;
        status: string;
    }>;
    getMyMemberships(userId: string): Promise<({
        Organization: {
            id: string;
            name: string;
            slug: string;
        };
    } & {
        organizationId: string;
        createdAt: Date;
        role: string;
        userId: string;
        status: string;
    })[]>;
    getAllPlatformOrganizations(): Promise<({
        _count: {
            users: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
        isDeliveryEnabled: boolean;
        isLocalEnabled: boolean;
        isMeetingEnabled: boolean;
        whatsappToken: string | null;
        whatsappPhoneId: string | null;
        whatsappVerifyToken: string | null;
        openaiApiKey: string | null;
        googleClientId: string | null;
        googleClientSecret: string | null;
    })[]>;
}
