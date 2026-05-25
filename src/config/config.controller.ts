import { Controller, Get, Put, Body, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConfigService } from './config.service';
import { OperationContact } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('config/contacts')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  async getContacts(@Request() req: any): Promise<OperationContact[]> {
    const orgId = req.user.orgId;
    return this.configService.getAdminDeliveryContacts(orgId);
  }

  @Put()
  async updateContacts(
    @Request() req: any,
    @Body() contacts: any[],
  ): Promise<OperationContact[]> {
    const orgId = req.user.orgId;
    return this.configService.updateAdminDeliveryContacts(orgId, contacts);
  }
}
