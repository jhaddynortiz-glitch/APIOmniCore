import { Module } from '@nestjs/common';
import { OperationContactsService } from './operation-contacts.service';
import { OperationContactsController } from './operation-contacts.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [OperationContactsController],
  providers: [OperationContactsService],
  exports: [OperationContactsService]
})
export class OperationContactsModule {}
