import { PromptsService } from './prompts.service';
export declare class PromptsController {
    private readonly promptsService;
    constructor(promptsService: PromptsService);
    findAll(req: any): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        organizationId: string;
        createdAt: Date;
        content: string;
    }[]>;
    findOne(id: string, req: any): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        organizationId: string;
        createdAt: Date;
        content: string;
    }>;
    create(req: any, data: any): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        organizationId: string;
        createdAt: Date;
        content: string;
    }>;
    update(id: string, req: any, data: any): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        organizationId: string;
        createdAt: Date;
        content: string;
    }>;
    remove(id: string, req: any): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        organizationId: string;
        createdAt: Date;
        content: string;
    }>;
}
