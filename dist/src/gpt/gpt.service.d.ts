import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { PromptsService } from '../prompts/prompts.service';
import { CategoriesService } from '../categories/categories.service';
export declare class GptService {
    private readonly prisma;
    private readonly productsService;
    private readonly promptsService;
    private readonly categoriesService;
    private readonly logger;
    private readonly DEFAULT_SYSTEM_PROMPT;
    constructor(prisma: PrismaService, productsService: ProductsService, promptsService: PromptsService, categoriesService: CategoriesService);
    generateReply(contactId: string, latestMessageBody: string, apiKey: string, orgId: string): Promise<{
        text: string;
        imageUrls: string[];
    }>;
}
