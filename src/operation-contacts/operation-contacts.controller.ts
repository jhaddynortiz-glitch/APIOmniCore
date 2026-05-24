import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { OperationContactsService } from './operation-contacts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('operation-contacts')
@UseGuards(JwtAuthGuard)
export class OperationContactsController {
  constructor(private readonly operationContactsService: OperationContactsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.operationContactsService.findAll(req.user.orgId);
  }

  @Post()
  create(@Request() req: any, @Body() data: any) {
    return this.operationContactsService.create(req.user.orgId, data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() data: any) {
    return this.operationContactsService.update(id, req.user.orgId, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.operationContactsService.remove(id, req.user.orgId);
  }
}
