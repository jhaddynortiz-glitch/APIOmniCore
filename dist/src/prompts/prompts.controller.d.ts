import { PromptsService } from './prompts.service';
export declare class PromptsController {
    private readonly promptsService;
    constructor(promptsService: PromptsService);
    findAll(req: any): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
        isActive: boolean;
        content: string;
    }[]>;
    findOne(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
        isActive: boolean;
        content: string;
    }>;
    create(req: any, data: any): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
        isActive: boolean;
        content: string;
    }>;
    update(id: string, req: any, data: any): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
        isActive: boolean;
        content: string;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        createdAt: Date;
        organizationId: string;
        name: string;
        isActive: boolean;
        content: string;
    }>;
}
