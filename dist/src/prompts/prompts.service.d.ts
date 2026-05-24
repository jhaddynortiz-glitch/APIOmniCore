import { PrismaService } from '../prisma/prisma.service';
export declare class PromptsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
        isActive: boolean;
        content: string;
    }[]>;
    findOne(id: string, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
        isActive: boolean;
        content: string;
    }>;
    create(organizationId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
        isActive: boolean;
        content: string;
    }>;
    update(id: string, organizationId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
        isActive: boolean;
        content: string;
    }>;
    remove(id: string, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
        isActive: boolean;
        content: string;
    }>;
    getActivePrompt(organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
        isActive: boolean;
        content: string;
    } | null>;
}
