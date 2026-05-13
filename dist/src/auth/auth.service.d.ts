import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private prisma;
    constructor(usersService: UsersService, jwtService: JwtService, prisma: PrismaService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            fullName: any;
            activeRole: string;
            activeOrganizationId: string | null;
            globalRole: string;
            organizations: {
                id: string;
                name: string;
                role: string;
            }[];
        };
    }>;
    register(data: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            fullName: any;
            activeRole: string;
            activeOrganizationId: string | null;
            globalRole: string;
            organizations: {
                id: string;
                name: string;
                role: string;
            }[];
        };
    }>;
    validateGoogleUser(profile: any): Promise<any>;
    switchOrganization(userId: string, targetOrgId: string): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            fullName: string | null;
            activeRole: string;
            activeOrganizationId: string;
            globalRole: string;
            organizations: {
                id: string;
                name: string;
                role: string;
            }[];
        };
    }>;
    forceSeed(): Promise<{
        success: boolean;
        message: string;
    }>;
    clearChats(): Promise<{
        success: boolean;
        message: string;
    }>;
    migrateContacts(): Promise<{
        success: boolean;
        message: string;
    }>;
    private encrypt;
}
