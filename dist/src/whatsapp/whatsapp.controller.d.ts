import { WhatsappService } from './whatsapp.service';
export declare class WhatsappController {
    private readonly whatsappService;
    private readonly logger;
    constructor(whatsappService: WhatsappService);
    verifyWebhook(mode: string, token: string, challenge: string): Promise<string>;
    handleWebhook(body: any): Promise<{
        status: string;
        message: string;
    }>;
    getContacts(req: any): Promise<({
        messages: {
            id: string;
            createdAt: Date;
            body: string | null;
            isFromMe: boolean;
            type: string;
            contactId: string;
            mediaUrl: string | null;
            mimeType: string | null;
        }[];
    } & {
        id: string;
        phoneNumber: string;
        name: string | null;
        organizationId: string;
        createdAt: Date;
        unreadCount: number;
    })[]>;
    createContact(req: any, name: string, phoneNumber: string): Promise<{
        messages: {
            id: string;
            createdAt: Date;
            body: string | null;
            isFromMe: boolean;
            type: string;
            contactId: string;
            mediaUrl: string | null;
            mimeType: string | null;
        }[];
    } & {
        id: string;
        phoneNumber: string;
        name: string | null;
        organizationId: string;
        createdAt: Date;
        unreadCount: number;
    }>;
    getMessages(contactId: string, limit?: number, cursor?: string): Promise<{
        id: string;
        createdAt: Date;
        body: string | null;
        isFromMe: boolean;
        type: string;
        contactId: string;
        mediaUrl: string | null;
        mimeType: string | null;
    }[]>;
    sendMessage(contactId: string, text: string, type?: string, mediaUrl?: string): Promise<{
        id: string;
        createdAt: Date;
        body: string | null;
        isFromMe: boolean;
        type: string;
        contactId: string;
        mediaUrl: string | null;
        mimeType: string | null;
    }>;
    markAsRead(contactId: string): Promise<{
        success: boolean;
    }>;
}
