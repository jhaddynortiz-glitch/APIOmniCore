import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './config.service';
import { PrismaService } from '../prisma/prisma.service';
import { OperationContact } from '@prisma/client';

describe('ConfigService', () => {
  let service: ConfigService;
  let prismaService: PrismaService;

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
      ],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAdminDeliveryContacts', () => {
    it('should return a list of contacts for the given organization', async () => {
      const mockContacts = [{ id: '1', type: 'ADMIN' }, { id: '2', type: 'DELIVERY' }] as OperationContact[];
      jest.spyOn(prismaService.operationContact, 'findMany').mockResolvedValue(mockContacts);

      const orgId = 'org-123';
      const result = await service.getAdminDeliveryContacts(orgId);

      expect(prismaService.operationContact.findMany).toHaveBeenCalledWith({
        where: { organizationId: orgId, type: { in: ['ADMIN', 'DELIVERY'] } },
        include: { User: { select: { id: true, fullName: true, email: true } } },
      });
      expect(result).toEqual(mockContacts);
    });
  });

  describe('updateAdminDeliveryContacts', () => {
    it('should replace contacts and return the new list', async () => {
      const orgId = 'org-123';
      const contacts = [{ name: 'Juan', phoneNumber: '123', type: 'ADMIN' }];
      
      jest.spyOn(prismaService.operationContact, 'deleteMany').mockResolvedValue({ count: 1 });
      jest.spyOn(prismaService.operationContact, 'createMany').mockResolvedValue({ count: 1 });
      
      const mockResult = [{ ...contacts[0], id: 'new-id', organizationId: orgId }] as any;
      jest.spyOn(service, 'getAdminDeliveryContacts').mockResolvedValue(mockResult);

      const result = await service.updateAdminDeliveryContacts(orgId, contacts);

      expect(prismaService.operationContact.deleteMany).toHaveBeenCalledWith({
        where: { organizationId: orgId, type: { in: ['ADMIN', 'DELIVERY'] } },
      });
      expect(prismaService.operationContact.createMany).toHaveBeenCalledWith({
        data: [{ name: 'Juan', phoneNumber: '123', type: 'ADMIN', organizationId: orgId }],
      });
      expect(result).toEqual(mockResult);
    });
  });
});
