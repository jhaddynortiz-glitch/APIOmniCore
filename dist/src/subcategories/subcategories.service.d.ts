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
        categoryId: string;
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
    })[]>;
    findByCategoryId(categoryId: string, organizationId: string): Promise<{
        categoryId: string;
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
    }[]>;
    findOne(id: string, organizationId: string): Promise<{
        Category: {
            id: string;
            name: string;
            organizationId: string;
            createdAt: Date;
        };
    } & {
        categoryId: string;
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
    }>;
    create(organizationId: string, data: {
        name: string;
        categoryId: string;
        id?: string;
    }): Promise<{
        categoryId: string;
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
    }>;
    update(id: string, organizationId: string, data: {
        name: string;
        categoryId: string;
    }): Promise<{
        categoryId: string;
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
    }>;
    remove(id: string, organizationId: string): Promise<{
        categoryId: string;
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
    }>;
}
