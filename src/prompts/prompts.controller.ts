import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PromptsService } from './prompts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('prompts')
@UseGuards(JwtAuthGuard)
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.promptsService.findAll(req.user.orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.promptsService.findOne(id, req.user.orgId);
  }

  @Post()
  create(@Request() req: any, @Body() data: any) {
    return this.promptsService.create(req.user.orgId, data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() data: any) {
    return this.promptsService.update(id, req.user.orgId, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.promptsService.remove(id, req.user.orgId);
  }
}
