import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @Request() req: any, 
    @Query('categoryId') categoryId?: string,
    @Query('subcategoryId') subcategoryId?: string,
    @Query('search') search?: string
  ) {
    return this.productsService.findAll(req.user.orgId, { categoryId, subcategoryId, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.productsService.findOne(id, req.user.orgId);
  }

  @Post()
  create(@Request() req: any, @Body() data: any) {
    return this.productsService.create(req.user.orgId, data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req: any, @Body() data: any) {
    return this.productsService.update(id, req.user.orgId, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.productsService.remove(id, req.user.orgId);
  }
}
