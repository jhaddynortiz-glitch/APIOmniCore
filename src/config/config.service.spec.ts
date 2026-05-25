import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';
import { PrismaService } from '../prisma/prisma.service';
import { OperationContact } from '@prisma/client';
import { OperationContactsService } from '../operation-contacts/operation-contacts.service';

describe('ConfigService', () => {
  let service: ConfigService;
  let prismaService: PrismaService;
  let operationContactsService: OperationContactsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        {
          provide: PrismaService,
          useValue: {
            operationContact: {
              findMany: jest.fn(),
              deleteMany: jest.fn(),
              createMany: jest.fn(),
            },
          },
        },
        {
          provide: OperationContactsService,
          useValue: {
            findAll: jest.fn(),
            remove: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
    prismaService = module.get<PrismaService>(PrismaService);
    operationContactsService = module.get<OperationContactsService>(
      OperationContactsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAdminDeliveryContacts', () => {
    it('should return a list of contacts for the given organization', async () => {
      const mockContacts = [
        { id: '1', type: 'ADMIN' },
        { id: '2', type: 'DELIVERY' },
      ] as any;
      jest
        .spyOn(operationContactsService, 'findAll')
        .mockResolvedValue(mockContacts);

      const orgId = 'org-123';
      const result = await service.getAdminDeliveryContacts(orgId);

      expect(operationContactsService.findAll).toHaveBeenCalledWith(orgId);
      expect(result).toEqual(mockContacts);
    });
  });

  describe('updateAdminDeliveryContacts', () => {
    it('should replace contacts and return the new list', async () => {
      const orgId = 'org-123';
      const contacts = [{ name: 'Juan', phoneNumber: '123', type: 'ADMIN' }];
      const existing = [{ id: 'old-1' }] as any[];

      jest
        .spyOn(operationContactsService, 'findAll')
        .mockResolvedValue(existing);
      jest
        .spyOn(operationContactsService, 'remove')
        .mockResolvedValue({} as any);

      const mockResult = {
        ...contacts[0],
        id: 'new-id',
        organizationId: orgId,
      } as any;
      jest
        .spyOn(operationContactsService, 'create')
        .mockResolvedValue(mockResult);

      const result = await service.updateAdminDeliveryContacts(orgId, contacts);

      expect(operationContactsService.remove).toHaveBeenCalledWith(
        'old-1',
        orgId,
      );
      expect(operationContactsService.create).toHaveBeenCalledWith(
        orgId,
        contacts[0],
      );
      expect(result).toEqual([mockResult]);
    });
  });
});
