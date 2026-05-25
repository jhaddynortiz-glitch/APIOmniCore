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
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.ordersService.findAll(req.user.orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.ordersService.findOne(id, req.user.orgId);
  }

  @Post()
  create(@Request() req: any, @Body() data: any) {
    return this.ordersService.create(req.user.orgId, data);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { status: string; deliveryContactId?: string },
  ) {
    return this.ordersService.updateStatus(
      id,
      req.user.orgId,
      body.status,
      body.deliveryContactId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.ordersService.remove(id, req.user.orgId);
  }
}
