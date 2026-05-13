import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: any): Promise<{
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
    seed(): Promise<{
        success: boolean;
        message: string;
    }>;
    migrateContacts(): Promise<{
        success: boolean;
        message: string;
    }>;
    clearChats(): Promise<{
        success: boolean;
        message: string;
    }>;
    login(loginDto: any): Promise<{
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
    } | {
        status: string;
        message: string;
    }>;
    switchOrganization(req: any, organizationId: string): Promise<{
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
}
