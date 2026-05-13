import { PrismaService } from '../prisma/prisma.service';
import { ChatGateway } from '../websockets/chat.gateway';
import { GptService } from '../gpt/gpt.service';
export declare class WhatsappService {
    private readonly prisma;
    private readonly chatGateway;
    private readonly gptService;
    private readonly logger;
    private readonly DELIVERY_CENTER;
    constructor(prisma: PrismaService, chatGateway: ChatGateway, gptService: GptService);
    verifyWebhookToken(token: string): Promise<boolean>;
    processWebhook(body: any): Promise<{
        id: string;
        createdAt: Date;
        body: string | null;
        mediaUrl: string | null;
        mimeType: string | null;
        isFromMe: boolean;
        type: string;
        contactId: string;
    } | undefined>;
    getContacts(organizationId: string): Promise<({
        messages: {
            id: string;
            createdAt: Date;
            body: string | null;
            mediaUrl: string | null;
            mimeType: string | null;
            isFromMe: boolean;
            type: string;
            contactId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        name: string | null;
        organizationId: string;
        phoneNumber: string;
        unreadCount: number;
    })[]>;
    getMessages(contactId: string, limit?: number, cursor?: string): Promise<{
        id: string;
        createdAt: Date;
        body: string | null;
        mediaUrl: string | null;
        mimeType: string | null;
        isFromMe: boolean;
        type: string;
        contactId: string;
    }[]>;
    sendMessage(contactId: string, bodyText: string, type?: string, mediaUrl?: string): Promise<{
        id: string;
        createdAt: Date;
        body: string | null;
        mediaUrl: string | null;
        mimeType: string | null;
        isFromMe: boolean;
        type: string;
        contactId: string;
    }>;
    private autoReplyWithGpt;
    private autoReplyWithLocation;
    private calculateDistance;
    markContactAsRead(contactId: string): Promise<{
        success: boolean;
    }>;
    createContact(name: string, phoneNumber: string, organizationId?: string): Promise<{
        messages: {
            id: string;
            createdAt: Date;
            body: string | null;
            mediaUrl: string | null;
            mimeType: string | null;
            isFromMe: boolean;
            type: string;
            contactId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        name: string | null;
        organizationId: string;
        phoneNumber: string;
        unreadCount: number;
    }>;
    private downloadWhatsappMedia;
    private toRad;
}
