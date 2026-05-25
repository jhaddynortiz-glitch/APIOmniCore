import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LogisticsService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // DELIVERY ZONES & RADII
  // ==========================================

  async findAllDeliveryZones(organizationId: string) {
    return this.prisma.deliveryZone.findMany({
      where: { organizationId },
      include: { radii: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneDeliveryZone(id: string, organizationId: string) {
    const zone = await this.prisma.deliveryZone.findFirst({
      where: { id, organizationId },
      include: { radii: true },
    });
    if (!zone) throw new NotFoundException('Zona de entrega no encontrada');
    return zone;
  }

  async createDeliveryZone(
    organizationId: string,
    data: {
      city: string;
      lat: number;
      lng: number;
      radii: { distanceKm: number; price: number }[];
    },
  ) {
    return this.prisma.deliveryZone.create({
      data: {
        city: data.city,
        lat: data.lat,
        lng: data.lng,
        organizationId,
        radii: {
          create: data.radii.map((r) => ({
            distanceKm: r.distanceKm,
            price: r.price,
          })),
        },
      },
      include: { radii: true },
    });
  }

  async updateDeliveryZone(
    id: string,
    organizationId: string,
    data: {
      city: string;
      lat: number;
      lng: number;
      radii: { distanceKm: number; price: number }[];
    },
  ) {
    await this.findOneDeliveryZone(id, organizationId);

    return this.prisma.$transaction(async (tx) => {
      // Delete old radii
      await tx.deliveryRadius.deleteMany({
        where: { deliveryZoneId: id },
      });

      // Update zone and create new radii
      return tx.deliveryZone.update({
        where: { id },
        data: {
          city: data.city,
          lat: data.lat,
          lng: data.lng,
          radii: {
            create: data.radii.map((r) => ({
              distanceKm: r.distanceKm,
              price: r.price,
            })),
          },
        },
        include: { radii: true },
      });
    });
  }

  async removeDeliveryZone(id: string, organizationId: string) {
    await this.findOneDeliveryZone(id, organizationId);
    return this.prisma.deliveryZone.delete({
      where: { id },
    });
  }

  // ==========================================
  // STORE LOCATIONS
  // ==========================================

  async findAllStoreLocations(organizationId: string) {
    return this.prisma.storeLocation.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneStoreLocation(id: string, organizationId: string) {
    const store = await this.prisma.storeLocation.findFirst({
      where: { id, organizationId },
    });
    if (!store) throw new NotFoundException('Sucursal no encontrada');
    return store;
  }

  async createStoreLocation(
    organizationId: string,
    data: {
      city: string;
      address: string;
      description?: string;
      lat: number;
      lng: number;
      imageUrl?: string;
    },
  ) {
    return this.prisma.storeLocation.create({
      data: {
        ...data,
        organizationId,
      },
    });
  }

  async updateStoreLocation(
    id: string,
    organizationId: string,
    data: {
      city: string;
      address: string;
      description?: string;
      lat: number;
      lng: number;
      imageUrl?: string;
    },
  ) {
    await this.findOneStoreLocation(id, organizationId);
    return this.prisma.storeLocation.update({
      where: { id },
      data,
    });
  }

  async removeStoreLocation(id: string, organizationId: string) {
    await this.findOneStoreLocation(id, organizationId);
    return this.prisma.storeLocation.delete({
      where: { id },
    });
  }

  // ==========================================
  // MEETING POINTS
  // ==========================================

  async findAllMeetingPoints(organizationId: string) {
    return this.prisma.meetingPoint.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneMeetingPoint(id: string, organizationId: string) {
    const point = await this.prisma.meetingPoint.findFirst({
      where: { id, organizationId },
    });
    if (!point) throw new NotFoundException('Punto de encuentro no encontrado');
    return point;
  }

  async createMeetingPoint(
    organizationId: string,
    data: { city: string; name: string; address?: string; schedule: string },
  ) {
    return this.prisma.meetingPoint.create({
      data: {
        ...data,
        organizationId,
      },
    });
  }

  async updateMeetingPoint(
    id: string,
    organizationId: string,
    data: { city: string; name: string; address?: string; schedule: string },
  ) {
    await this.findOneMeetingPoint(id, organizationId);
    return this.prisma.meetingPoint.update({
      where: { id },
      data,
    });
  }

  async removeMeetingPoint(id: string, organizationId: string) {
    await this.findOneMeetingPoint(id, organizationId);
    return this.prisma.meetingPoint.delete({
      where: { id },
    });
  }
}
