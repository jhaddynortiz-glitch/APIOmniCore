import { Module } from '@nestjs/common';
import { PromptsService } from './prompts.service';
import { PromptsController } from './prompts.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PromptsService],
  controllers: [PromptsController],
  exports: [PromptsService],
})
export class PromptsModule {}
