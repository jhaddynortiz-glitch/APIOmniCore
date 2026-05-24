import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(req: any, categoryId?: string, subcategoryId?: string, search?: string): Promise<({
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
    findOne(id: string, req: any): Promise<{
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
    create(req: any, data: any): Promise<{
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
    update(id: string, req: any, data: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
}
