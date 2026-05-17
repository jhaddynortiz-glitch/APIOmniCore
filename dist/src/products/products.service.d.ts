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
            id: string;
            name: string;
            organizationId: string;
            createdAt: Date;
            categoryId: string;
        }) | null;
    } & {
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        description: string | null;
        subcategoryId: string | null;
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
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
            id: string;
            name: string;
            organizationId: string;
            createdAt: Date;
            categoryId: string;
        }) | null;
    } & {
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        description: string | null;
        subcategoryId: string | null;
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
    }>;
    create(organizationId: string, data: any): Promise<{
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        description: string | null;
        subcategoryId: string | null;
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
    }>;
    update(id: string, organizationId: string, data: any): Promise<{
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        description: string | null;
        subcategoryId: string | null;
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
    }>;
    remove(id: string, organizationId: string): Promise<{
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        description: string | null;
        subcategoryId: string | null;
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
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
            id: string;
            name: string;
            organizationId: string;
            createdAt: Date;
            categoryId: string;
        }) | null;
    } & {
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        description: string | null;
        subcategoryId: string | null;
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
    })[]>;
}
