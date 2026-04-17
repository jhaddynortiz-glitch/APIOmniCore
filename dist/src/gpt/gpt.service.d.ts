import { PrismaService } from '../prisma/prisma.service';
export declare class GptService {
    private readonly prisma;
    private readonly logger;
    private openai;
    private readonly SYSTEM_PROMPT;
    constructor(prisma: PrismaService);
    generateReply(contactId: string, latestMessageBody: string): Promise<string>;
}
