import { Module } from '@nestjs/common';
import { KeywordService } from './keyword.service';
import { KeywordController } from './keyword.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [KeywordService],
  controllers: [KeywordController],
  exports: [KeywordService],
})
export class KeywordModule {}
