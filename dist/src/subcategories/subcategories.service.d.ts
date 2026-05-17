import { PrismaService } from '../prisma/prisma.service';
export declare class SubcategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(organizationId: string): Promise<({
        Category: {
            id: string;
            name: string;
            organizationId: string;
            createdAt: Date;
        };
    } & {
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        categoryId: string;
    })[]>;
    findByCategoryId(categoryId: string, organizationId: string): Promise<{
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        categoryId: string;
    }[]>;
    findOne(id: string, organizationId: string): Promise<{
        Category: {
            id: string;
            name: string;
            organizationId: string;
            createdAt: Date;
        };
    } & {
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        categoryId: string;
    }>;
    create(organizationId: string, data: {
        name: string;
        categoryId: string;
        id?: string;
    }): Promise<{
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        categoryId: string;
    }>;
    update(id: string, organizationId: string, data: {
        name: string;
        categoryId: string;
    }): Promise<{
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        categoryId: string;
    }>;
    remove(id: string, organizationId: string): Promise<{
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        categoryId: string;
    }>;
}
