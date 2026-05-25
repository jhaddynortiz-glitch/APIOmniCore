import { Test, TestingModule } from '@nestjs/testing';
import { KeywordService } from './keyword.service';
import { PrismaService } from '../prisma/prisma.service';

describe('KeywordService', () => {
  let service: KeywordService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeywordService,
        {
          provide: PrismaService,
          useValue: {
            keywordTrigger: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<KeywordService>(KeywordService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a keyword trigger', async () => {
    const dto = { keyword: 'promo', response: 'promo msg' };
    jest.spyOn(prismaService.keywordTrigger, 'create').mockResolvedValue({ id: '1', ...dto, organizationId: 'org-1' } as any);

    const result = await service.create(dto, 'org-1');
    expect(result.keyword).toEqual('promo');
    expect(prismaService.keywordTrigger.create).toHaveBeenCalledWith({
      data: { ...dto, organizationId: 'org-1' }
    });
  });

  it('should return all keyword triggers for an org', async () => {
    jest.spyOn(prismaService.keywordTrigger, 'findMany').mockResolvedValue([] as any);

    const result = await service.findAll('org-1');
    expect(result).toEqual([]);
    expect(prismaService.keywordTrigger.findMany).toHaveBeenCalledWith({
      where: { organizationId: 'org-1' },
      orderBy: { createdAt: 'desc' }
    });
  });
});
