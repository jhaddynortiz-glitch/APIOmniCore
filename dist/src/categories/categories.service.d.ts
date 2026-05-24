import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
    }[]>;
    findOne(id: string, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
    }>;
    create(organizationId: string, data: {
        name: string;
        id?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
    }>;
    update(id: string, organizationId: string, data: {
        name: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
    }>;
    remove(id: string, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
    }>;
}
