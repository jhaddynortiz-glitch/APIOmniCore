import { SubcategoriesService } from './subcategories.service';
export declare class SubcategoriesController {
    private readonly subcategoriesService;
    constructor(subcategoriesService: SubcategoriesService);
    findAll(req: any, categoryId?: string): Promise<{
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        categoryId: string;
    }[]>;
    create(req: any, data: any): Promise<{
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        categoryId: string;
    }>;
    update(id: string, req: any, data: any): Promise<{
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        categoryId: string;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        name: string;
        organizationId: string;
        createdAt: Date;
        categoryId: string;
    }>;
}
