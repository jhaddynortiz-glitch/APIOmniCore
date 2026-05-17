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
    findOne(id: string, req: any): Promise<{
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
    create(req: any, data: any): Promise<{
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
    update(id: string, req: any, data: any): Promise<{
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
    remove(id: string, req: any): Promise<{
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
}
