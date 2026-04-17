import { Injectable, OnModuleInit, Logger, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      Logger.log('Base de datos conectada correctamente (Prisma 7.7 con pg-adapter)', PrismaService.name);
    } catch (e) {
      Logger.error('Error conectando a la BD', e.stack, PrismaService.name);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
