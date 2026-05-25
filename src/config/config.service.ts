import { Injectable } from '@nestjs/common';
import { OperationContactsService } from '../operation-contacts/operation-contacts.service';
import { OperationContact } from '@prisma/client';

@Injectable()
export class ConfigService {
  constructor(
    private readonly operationContactsService: OperationContactsService,
  ) {}

  // Get admin and delivery contacts for the organization
  async getAdminDeliveryContacts(
    organizationId: string,
  ): Promise<OperationContact[]> {
    return this.operationContactsService.findAll(organizationId);
  }

  // Update contacts (bulk replace) – expects an array of contacts with type ADMIN or DELIVERY
  async updateAdminDeliveryContacts(
    organizationId: string,
    contacts: Partial<OperationContact>[],
  ): Promise<OperationContact[]> {
    // For simplicity, remove existing contacts of type ADMIN/DOCUMENT and recreate
    const existing =
      await this.operationContactsService.findAll(organizationId);
    // Delete existing contacts of those types
    await Promise.all(
      existing.map((c) =>
        this.operationContactsService.remove(c.id, organizationId),
      ),
    );
    // Create new contacts
    const created = await Promise.all(
      contacts.map((c) =>
        this.operationContactsService.create(organizationId, c),
      ),
    );
    return created;
  }
}
