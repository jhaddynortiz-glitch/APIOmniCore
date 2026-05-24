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
                createdAt: Date;
                organizationId: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            organizationId: string;
            name: string;
            categoryId: string;
        }) | null;
        ads: {
            id: string;
            createdAt: Date;
            adId: string;
            platform: string;
            productId: string;
        }[];
        triggers: {
            id: string;
            createdAt: Date;
            productId: string;
            keyword: string;
            response: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
        isDeliveryEnabled: boolean;
        isLocalEnabled: boolean;
        isMeetingEnabled: boolean;
        description: string | null;
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
        facebookAdId: string | null;
        subcategoryId: string | null;
        cardDescription: string | null;
        cardImageUrl: string | null;
    })[]>;
    findOne(id: string, organizationId: string): Promise<{
        Subcategory: ({
            Category: {
                id: string;
                createdAt: Date;
                organizationId: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            organizationId: string;
            name: string;
            categoryId: string;
        }) | null;
        ads: {
            id: string;
            createdAt: Date;
            adId: string;
            platform: string;
            productId: string;
        }[];
        triggers: {
            id: string;
            createdAt: Date;
            productId: string;
            keyword: string;
            response: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
        isDeliveryEnabled: boolean;
        isLocalEnabled: boolean;
        isMeetingEnabled: boolean;
        description: string | null;
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
        facebookAdId: string | null;
        subcategoryId: string | null;
        cardDescription: string | null;
        cardImageUrl: string | null;
    }>;
    create(organizationId: string, data: any): Promise<{
        ads: {
            id: string;
            createdAt: Date;
            adId: string;
            platform: string;
            productId: string;
        }[];
        triggers: {
            id: string;
            createdAt: Date;
            productId: string;
            keyword: string;
            response: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
        isDeliveryEnabled: boolean;
        isLocalEnabled: boolean;
        isMeetingEnabled: boolean;
        description: string | null;
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
        facebookAdId: string | null;
        subcategoryId: string | null;
        cardDescription: string | null;
        cardImageUrl: string | null;
    }>;
    update(id: string, organizationId: string, data: any): Promise<{
        ads: {
            id: string;
            createdAt: Date;
            adId: string;
            platform: string;
            productId: string;
        }[];
        triggers: {
            id: string;
            createdAt: Date;
            productId: string;
            keyword: string;
            response: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
        isDeliveryEnabled: boolean;
        isLocalEnabled: boolean;
        isMeetingEnabled: boolean;
        description: string | null;
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
        facebookAdId: string | null;
        subcategoryId: string | null;
        cardDescription: string | null;
        cardImageUrl: string | null;
    }>;
    remove(id: string, organizationId: string): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
        isDeliveryEnabled: boolean;
        isLocalEnabled: boolean;
        isMeetingEnabled: boolean;
        description: string | null;
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
        facebookAdId: string | null;
        subcategoryId: string | null;
        cardDescription: string | null;
        cardImageUrl: string | null;
    }>;
    findAllActiveForGpt(organizationId: string): Promise<({
        Subcategory: ({
            Category: {
                id: string;
                createdAt: Date;
                organizationId: string;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            organizationId: string;
            name: string;
            categoryId: string;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
        isDeliveryEnabled: boolean;
        isLocalEnabled: boolean;
        isMeetingEnabled: boolean;
        description: string | null;
        price: number;
        imageUrl: string | null;
        currency: string;
        stock: number;
        isActive: boolean;
        facebookAdId: string | null;
        subcategoryId: string | null;
        cardDescription: string | null;
        cardImageUrl: string | null;
    })[]>;
}
