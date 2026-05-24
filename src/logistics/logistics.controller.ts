import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('logistics')
@UseGuards(JwtAuthGuard)
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  // ==========================================
  // DELIVERY ZONES
  // ==========================================

  @Get('delivery-zones')
  findAllDeliveryZones(@Request() req: any) {
    return this.logisticsService.findAllDeliveryZones(req.user.orgId);
  }

  @Get('delivery-zones/:id')
  findOneDeliveryZone(@Param('id') id: string, @Request() req: any) {
    return this.logisticsService.findOneDeliveryZone(id, req.user.orgId);
  }

  @Post('delivery-zones')
  createDeliveryZone(@Request() req: any, @Body() data: any) {
    return this.logisticsService.createDeliveryZone(req.user.orgId, data);
  }

  @Patch('delivery-zones/:id')
  updateDeliveryZone(@Param('id') id: string, @Request() req: any, @Body() data: any) {
    return this.logisticsService.updateDeliveryZone(id, req.user.orgId, data);
  }

  @Delete('delivery-zones/:id')
  removeDeliveryZone(@Param('id') id: string, @Request() req: any) {
    return this.logisticsService.removeDeliveryZone(id, req.user.orgId);
  }

  // ==========================================
  // STORE LOCATIONS
  // ==========================================

  @Get('store-locations')
  findAllStoreLocations(@Request() req: any) {
    return this.logisticsService.findAllStoreLocations(req.user.orgId);
  }

  @Get('store-locations/:id')
  findOneStoreLocation(@Param('id') id: string, @Request() req: any) {
    return this.logisticsService.findOneStoreLocation(id, req.user.orgId);
  }

  @Post('store-locations')
  createStoreLocation(@Request() req: any, @Body() data: any) {
    return this.logisticsService.createStoreLocation(req.user.orgId, data);
  }

  @Patch('store-locations/:id')
  updateStoreLocation(@Param('id') id: string, @Request() req: any, @Body() data: any) {
    return this.logisticsService.updateStoreLocation(id, req.user.orgId, data);
  }

  @Delete('store-locations/:id')
  removeStoreLocation(@Param('id') id: string, @Request() req: any) {
    return this.logisticsService.removeStoreLocation(id, req.user.orgId);
  }

  // ==========================================
  // MEETING POINTS
  // ==========================================

  @Get('meeting-points')
  findAllMeetingPoints(@Request() req: any) {
    return this.logisticsService.findAllMeetingPoints(req.user.orgId);
  }

  @Get('meeting-points/:id')
  findOneMeetingPoint(@Param('id') id: string, @Request() req: any) {
    return this.logisticsService.findOneMeetingPoint(id, req.user.orgId);
  }

  @Post('meeting-points')
  createMeetingPoint(@Request() req: any, @Body() data: any) {
    return this.logisticsService.createMeetingPoint(req.user.orgId, data);
  }

  @Patch('meeting-points/:id')
  updateMeetingPoint(@Param('id') id: string, @Request() req: any, @Body() data: any) {
    return this.logisticsService.updateMeetingPoint(id, req.user.orgId, data);
  }

  @Delete('meeting-points/:id')
  removeMeetingPoint(@Param('id') id: string, @Request() req: any) {
    return this.logisticsService.removeMeetingPoint(id, req.user.orgId);
  }
}
