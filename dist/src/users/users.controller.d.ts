import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    checkUser(email: string): Promise<{
        exists: boolean;
        user: {
            id: string;
            email: string;
            fullName: string | null;
            globalRole: string;
        } | null;
    }>;
    addUserToOrg(req: any, data: {
        email: string;
        role: string;
    }): Promise<any>;
    getOrgMembers(req: any): Promise<({
        User: {
            id: string;
            email: string;
            fullName: string | null;
            avatarUrl: string | null;
            globalRole: string;
        };
    } & {
        createdAt: Date;
        userId: string;
        organizationId: string;
        role: string;
        status: string;
    })[]>;
    updateOrgMember(req: any, userId: string, data: {
        role?: string;
        status?: string;
    }): Promise<{
        User: {
            id: string;
            email: string;
            fullName: string | null;
        };
    } & {
        createdAt: Date;
        userId: string;
        organizationId: string;
        role: string;
        status: string;
    }>;
    removeOrgMember(req: any, userId: string): Promise<{
        createdAt: Date;
        userId: string;
        organizationId: string;
        role: string;
        status: string;
    }>;
    getMyInvitations(req: any): Promise<({
        Organization: {
            id: string;
            name: string;
            slug: string;
        };
    } & {
        createdAt: Date;
        userId: string;
        organizationId: string;
        role: string;
        status: string;
    })[]>;
    acceptInvitation(req: any, organizationId: string): Promise<{
        Organization: {
            id: string;
            name: string;
        };
    } & {
        createdAt: Date;
        userId: string;
        organizationId: string;
        role: string;
        status: string;
    }>;
    getMyMemberships(req: any): Promise<({
        Organization: {
            id: string;
            name: string;
            slug: string;
        };
    } & {
        createdAt: Date;
        userId: string;
        organizationId: string;
        role: string;
        status: string;
    })[]>;
    getAllOrgs(req: any): Promise<({
        _count: {
            users: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        slug: string;
        whatsappToken: string | null;
        whatsappPhoneId: string | null;
        whatsappVerifyToken: string | null;
        openaiApiKey: string | null;
        googleClientId: string | null;
        googleClientSecret: string | null;
        logoUrl: string | null;
        isDeliveryEnabled: boolean;
        isLocalEnabled: boolean;
        isMeetingEnabled: boolean;
    })[] | {
        status: string;
        message: string;
    }>;
}
