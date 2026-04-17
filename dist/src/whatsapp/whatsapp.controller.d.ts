import { WhatsappService } from './whatsapp.service';
export declare class WhatsappController {
    private readonly whatsappService;
    private readonly logger;
    constructor(whatsappService: WhatsappService);
    verifyWebhook(mode: string, token: string, challenge: string): string;
    handleWebhook(body: any): Promise<{
        status: string;
        message: string;
    }>;
    getContacts(): Promise<({
        messages: {
            id: string;
            createdAt: Date;
            body: string | null;
            isFromMe: boolean;
            type: string;
            contactId: string;
        }[];
    } & {
        id: string;
        name: string | null;
        createdAt: Date;
        organizationId: string;
        phoneNumber: string;
        unreadCount: number;
    })[]>;
    createContact(name: string, phoneNumber: string): Promise<{
        messages: {
            id: string;
            createdAt: Date;
            body: string | null;
            isFromMe: boolean;
            type: string;
            contactId: string;
        }[];
    } & {
        id: string;
        name: string | null;
        createdAt: Date;
        organizationId: string;
        phoneNumber: string;
        unreadCount: number;
    }>;
    getMessages(contactId: string, limit?: number, cursor?: string): Promise<{
        id: string;
        createdAt: Date;
        body: string | null;
        isFromMe: boolean;
        type: string;
        contactId: string;
    }[]>;
    sendMessage(contactId: string, text: string): Promise<{
        id: string;
        createdAt: Date;
        body: string | null;
        isFromMe: boolean;
        type: string;
        contactId: string;
    }>;
    markAsRead(contactId: string): Promise<{
        success: boolean;
    }>;
}
