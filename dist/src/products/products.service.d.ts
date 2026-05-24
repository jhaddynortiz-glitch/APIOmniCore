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
        ads: {
            id: string;
            createdAt: Date;
            adId: string;
            platform: string;
            productId: string;
        }[];
    } & {
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        description: string | null;
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
        facebookAdId: string | null;
        subcategoryId: string | null;
        isDeliveryEnabled: boolean;
        isLocalEnabled: boolean;
        isMeetingEnabled: boolean;
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
        ads: {
            id: string;
            createdAt: Date;
            adId: string;
            platform: string;
            productId: string;
        }[];
    } & {
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        description: string | null;
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
        facebookAdId: string | null;
        subcategoryId: string | null;
        isDeliveryEnabled: boolean;
        isLocalEnabled: boolean;
        isMeetingEnabled: boolean;
    }>;
    create(organizationId: string, data: any): Promise<{
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        description: string | null;
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
        facebookAdId: string | null;
        subcategoryId: string | null;
        isDeliveryEnabled: boolean;
        isLocalEnabled: boolean;
        isMeetingEnabled: boolean;
    }>;
    update(id: string, organizationId: string, data: any): Promise<{
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        description: string | null;
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
        facebookAdId: string | null;
        subcategoryId: string | null;
        isDeliveryEnabled: boolean;
        isLocalEnabled: boolean;
        isMeetingEnabled: boolean;
    }>;
    remove(id: string, organizationId: string): Promise<{
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        description: string | null;
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
        facebookAdId: string | null;
        subcategoryId: string | null;
        isDeliveryEnabled: boolean;
        isLocalEnabled: boolean;
        isMeetingEnabled: boolean;
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
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
        facebookAdId: string | null;
        subcategoryId: string | null;
        isDeliveryEnabled: boolean;
        isLocalEnabled: boolean;
        isMeetingEnabled: boolean;
    })[]>;
}
