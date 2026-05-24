import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.order.findMany({
      where: { organizationId },
      include: {
        Contact: true,
        StoreLocation: true,
        MeetingPoint: true,
        items: {
          include: {
            Product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, organizationId },
      include: {
        Contact: true,
        StoreLocation: true,
        MeetingPoint: true,
        items: {
          include: {
            Product: true,
          },
        },
      },
    });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return order;
  }

  async create(
    organizationId: string,
    data: {
      contactId: string;
      status?: string;
      deliveryMethod?: string;
      deliveryCost?: number;
      shippingAddress?: string;
      lat?: number;
      lng?: number;
      storeLocationId?: string;
      meetingPointId?: string;
      total: number;
      items: { productId: string; quantity: number; price: number }[];
    }
  ) {
    const { items, ...orderData } = data;

    return this.prisma.order.create({
      data: {
        ...orderData,
        organizationId,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            Product: true,
          },
        },
      },
    });
  }

  async updateStatus(id: string, organizationId: string, status: string) {
    await this.findOne(id, organizationId);
    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.order.delete({
      where: { id },
    });
  }
}
