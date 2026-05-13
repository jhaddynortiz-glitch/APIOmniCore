import { PrismaService } from '../prisma/prisma.service';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(organizationId: string, filters?: {
        categoryId?: string;
        subcategoryId?: string;
        search?: string;
    }): Promise<({
        Subcategory: ({
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
        }) | null;
    } & {
        subcategoryId: string | null;
        id: string;
        name: string;
        description: string | null;
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
        organizationId: string;
        createdAt: Date;
    })[]>;
    findOne(id: string, organizationId: string): Promise<{
        Subcategory: ({
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
        }) | null;
    } & {
        subcategoryId: string | null;
        id: string;
        name: string;
        description: string | null;
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
        organizationId: string;
        createdAt: Date;
    }>;
    create(organizationId: string, data: any): Promise<{
        subcategoryId: string | null;
        id: string;
        name: string;
        description: string | null;
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
        organizationId: string;
        createdAt: Date;
    }>;
    update(id: string, organizationId: string, data: any): Promise<{
        subcategoryId: string | null;
        id: string;
        name: string;
        description: string | null;
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
        organizationId: string;
        createdAt: Date;
    }>;
    remove(id: string, organizationId: string): Promise<{
        subcategoryId: string | null;
        id: string;
        name: string;
        description: string | null;
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
        organizationId: string;
        createdAt: Date;
    }>;
    findAllActiveForGpt(organizationId: string): Promise<({
        Subcategory: ({
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
        }) | null;
    } & {
        subcategoryId: string | null;
        id: string;
        name: string;
        description: string | null;
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
        organizationId: string;
        createdAt: Date;
    })[]>;
}
