import { Test, TestingModule } from '@nestjs/testing';
import { WhatsappService } from './whatsapp.service';
import { PrismaService } from '../prisma/prisma.service';
import { GptService } from '../gpt/gpt.service';
import { ChatGateway } from '../websockets/chat.gateway';

describe('WhatsappService', () => {
  let service: WhatsappService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WhatsappService,
        { provide: PrismaService, useValue: {} },
        { provide: GptService, useValue: {} },
        { provide: ChatGateway, useValue: {} }
      ],
    }).compile();

    service = module.get<WhatsappService>(WhatsappService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
