import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.categoriesService.findAll(req.user.orgId);
  }

  @Post()
  create(@Request() req: any, @Body() data: any) {
    return this.categoriesService.create(req.user.orgId, data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() data: any) {
    return this.categoriesService.update(id, req.user.orgId, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.categoriesService.remove(id, req.user.orgId);
  }
}
