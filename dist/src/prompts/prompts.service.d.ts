import { PrismaService } from '../prisma/prisma.service';
export declare class PromptsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(organizationId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        organizationId: string;
        createdAt: Date;
        content: string;
    }[]>;
    findOne(id: string, organizationId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        organizationId: string;
        createdAt: Date;
        content: string;
    }>;
    create(organizationId: string, data: any): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        organizationId: string;
        createdAt: Date;
        content: string;
    }>;
    update(id: string, organizationId: string, data: any): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        organizationId: string;
        createdAt: Date;
        content: string;
    }>;
    remove(id: string, organizationId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        organizationId: string;
        createdAt: Date;
        content: string;
    }>;
    getActivePrompt(organizationId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        organizationId: string;
        createdAt: Date;
        content: string;
    } | null>;
}
