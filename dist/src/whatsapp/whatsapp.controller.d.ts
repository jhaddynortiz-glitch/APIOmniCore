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
    createContact(req: any, name: string, phoneNumber: string): Promise<{
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
    sendMessage(contactId: string, text: string, type?: string, mediaUrl?: string): Promise<{
        id: string;
        createdAt: Date;
        body: string | null;
        mediaUrl: string | null;
        mimeType: string | null;
        isFromMe: boolean;
        type: string;
        contactId: string;
    }>;
    markAsRead(contactId: string): Promise<{
        success: boolean;
    }>;
}
