import { ProductsService } from './products.service';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(req: any, categoryId?: string, subcategoryId?: string, search?: string): Promise<({
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
    findOne(id: string, req: any): Promise<{
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
    create(req: any, data: any): Promise<{
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
    update(id: string, req: any, data: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
}
