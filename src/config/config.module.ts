import { Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';
import { OperationContactsModule } from '../operation-contacts/operation-contacts.module';

@Module({
  imports: [OperationContactsModule],
  providers: [ConfigService],
  controllers: [ConfigController],
  exports: [ConfigService],
})
export class ConfigModule {}
