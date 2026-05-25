import { join } from 'path';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { PrismaModule } from './prisma/prisma.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { PromptsModule } from './prompts/prompts.module';
import { CategoriesModule } from './categories/categories.module';
import { SubcategoriesModule } from './subcategories/subcategories.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { LogisticsModule } from './logistics/logistics.module';
import { TemplatesModule } from './templates/templates.module';
import { OrdersModule } from './orders/orders.module';
import { OperationContactsModule } from './operation-contacts/operation-contacts.module';
import { ConfigModule } from './config/config.module';
import { UploadController } from './upload/upload.controller';
import { UploadService } from './upload/upload.service';
import { KeywordModule } from './keyword/keyword.module';

@Module({
  imports: [
    WhatsappModule, 
    PrismaModule, 
    WebsocketsModule, 
    AuthModule, 
    UsersModule,
    ProductsModule,
    PromptsModule,
    CategoriesModule,
    SubcategoriesModule,
    OrganizationsModule,
    LogisticsModule,
    TemplatesModule,
    OrdersModule,
    OperationContactsModule,
    ConfigModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
    }),
    KeywordModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService, UploadService],
})
export class AppModule {}
