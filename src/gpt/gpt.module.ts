import { Module } from '@nestjs/common';
import { GptService } from './gpt.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [GptService],
  exports: [GptService],
})
export class GptModule {}
