import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        organizationId: string;
    }[]>;
    findOne(id: string, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        organizationId: string;
    }>;
    create(organizationId: string, data: {
        name: string;
        id?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        organizationId: string;
    }>;
    update(id: string, organizationId: string, data: {
        name: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        organizationId: string;
    }>;
    remove(id: string, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        organizationId: string;
    }>;
}
