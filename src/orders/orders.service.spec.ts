import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { BadRequestException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: {
            order: {
              findFirst: jest.fn(),
              update: jest.fn(),
            },
            keywordTrigger: {
              findMany: jest.fn(),
            },
          },
        },
        {
          provide: WhatsappService,
          useValue: {
            createContact: jest.fn(),
            sendMessage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateStatus', () => {
    it('should throw BadRequestException if transition is invalid', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'ENTREGADO',
        organizationId: 'org-1',
      };
      jest
        .spyOn(prismaService.order, 'findFirst')
        .mockResolvedValue(mockOrder as any);

      await expect(
        service.updateStatus('order-1', 'org-1', 'PENDING'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow valid transition', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'PENDING',
        organizationId: 'org-1',
      };
      jest
        .spyOn(prismaService.order, 'findFirst')
        .mockResolvedValue(mockOrder as any);
      jest
        .spyOn(prismaService.order, 'update')
        .mockResolvedValue({ ...mockOrder, status: 'EN_COLA' } as any);

      const result = await service.updateStatus('order-1', 'org-1', 'EN_COLA');

      expect(prismaService.order.update).toHaveBeenCalled();
      expect(result.status).toEqual('EN_COLA');
    });
  });
});
