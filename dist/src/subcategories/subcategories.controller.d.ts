import { SubcategoriesService } from './subcategories.service';
export declare class SubcategoriesController {
    private readonly subcategoriesService;
    constructor(subcategoriesService: SubcategoriesService);
    findAll(req: any, categoryId?: string): Promise<{
        categoryId: string;
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
    }[]>;
    create(req: any, data: any): Promise<{
        categoryId: string;
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
    }>;
    update(id: string, req: any, data: any): Promise<{
        categoryId: string;
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
    }>;
    remove(id: string, req: any): Promise<{
        categoryId: string;
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
    }>;
}
