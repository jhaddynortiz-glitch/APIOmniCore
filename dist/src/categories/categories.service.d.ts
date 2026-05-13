import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(organizationId: string): Promise<{
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
    }[]>;
    findOne(id: string, organizationId: string): Promise<{
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
    }>;
    create(organizationId: string, data: {
        name: string;
        id?: string;
    }): Promise<{
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
    }>;
    update(id: string, organizationId: string, data: {
        name: string;
    }): Promise<{
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
    }>;
    remove(id: string, organizationId: string): Promise<{
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
    }>;
}
