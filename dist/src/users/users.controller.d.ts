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
        organizationId: string;
        createdAt: Date;
        role: string;
        status: string;
        userId: string;
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
        organizationId: string;
        createdAt: Date;
        role: string;
        status: string;
        userId: string;
    }>;
    removeOrgMember(req: any, userId: string): Promise<{
        organizationId: string;
        createdAt: Date;
        role: string;
        status: string;
        userId: string;
    }>;
    getMyInvitations(req: any): Promise<({
        Organization: {
            id: string;
            name: string;
            slug: string;
        };
    } & {
        organizationId: string;
        createdAt: Date;
        role: string;
        status: string;
        userId: string;
    })[]>;
    acceptInvitation(req: any, organizationId: string): Promise<{
        Organization: {
            id: string;
            name: string;
        };
    } & {
        organizationId: string;
        createdAt: Date;
        role: string;
        status: string;
        userId: string;
    }>;
    getMyMemberships(req: any): Promise<({
        Organization: {
            id: string;
            name: string;
            slug: string;
        };
    } & {
        organizationId: string;
        createdAt: Date;
        role: string;
        status: string;
        userId: string;
    })[]>;
    getAllOrgs(req: any): Promise<({
        _count: {
            users: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        slug: string;
        whatsappToken: string | null;
        whatsappPhoneId: string | null;
        whatsappVerifyToken: string | null;
        openaiApiKey: string | null;
        googleClientId: string | null;
        googleClientSecret: string | null;
    })[] | {
        status: string;
        message: string;
    }>;
}
