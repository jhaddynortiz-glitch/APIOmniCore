import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        organizationId: string;
    }[]>;
    create(req: any, data: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        organizationId: string;
    }>;
    update(id: string, req: any, data: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        organizationId: string;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        organizationId: string;
    }>;
}
