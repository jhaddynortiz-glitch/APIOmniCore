import { Module } from '@nestjs/common';
import { GptService } from './gpt.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';
import { PromptsModule } from '../prompts/prompts.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [PrismaModule, ProductsModule, PromptsModule, CategoriesModule],
  providers: [GptService],
  exports: [GptService],
})
export class GptModule {}
