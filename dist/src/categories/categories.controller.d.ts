import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(req: any): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
    }[]>;
    create(req: any, data: any): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
    }>;
    update(id: string, req: any, data: any): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
    }>;
}
