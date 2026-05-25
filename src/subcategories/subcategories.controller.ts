import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { SubcategoriesService } from './subcategories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('subcategories')
@UseGuards(JwtAuthGuard)
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @Get()
  findAll(@Request() req: any, @Query('categoryId') categoryId?: string) {
    if (categoryId) {
      return this.subcategoriesService.findByCategoryId(
        categoryId,
        req.user.orgId,
      );
    }
    return this.subcategoriesService.findAll(req.user.orgId);
  }

  @Post()
  create(@Request() req: any, @Body() data: any) {
    return this.subcategoriesService.create(req.user.orgId, data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() data: any) {
    return this.subcategoriesService.update(id, req.user.orgId, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.subcategoriesService.remove(id, req.user.orgId);
  }
}
