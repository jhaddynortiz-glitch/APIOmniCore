import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private whatsappService: WhatsappService,
  ) {}

  async findAll(organizationId: string) {
    return this.prisma.order.findMany({
      where: { organizationId },
      include: {
        Contact: true,
        StoreLocation: true,
        MeetingPoint: true,
        DeliveryContact: true,
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
        DeliveryContact: true,
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
    },
  ) {
    const { items, ...orderData } = data;

    const order = await this.prisma.order.create({
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
        Contact: true,
        items: {
          include: {
            Product: true,
          },
        },
      },
    });

    if (order.status === 'EN_COLA') {
      await this.notifyAdminsNewOrder(organizationId, order);
    }

    // Keyword matching
    const keywords = await this.prisma.keywordTrigger.findMany({
      where: { organizationId },
    });

    const productNames = order.items
      .map((i) => i.Product?.name || '')
      .join(' ');
    const orderText =
      `${order.shippingAddress || ''} ${productNames}`.toLowerCase();

    const matchedResponses = keywords
      .filter((k) => orderText.includes(k.keyword.toLowerCase()))
      .map((k) => k.response);

    return {
      ...order,
      automaticResponses: matchedResponses,
    };
  }

  async updateStatus(
    id: string,
    organizationId: string,
    status: string,
    deliveryContactId?: string,
  ) {
    const order = await this.findOne(id, organizationId);
    const oldStatus = order.status;

    const validTransitions: Record<string, string[]> = {
      PENDING: ['EN_COLA', 'CONFIRMED', 'CANCELLED'],
      EN_COLA: ['ASIGNADO', 'CANCELLED'],
      ASIGNADO: ['EN_CAMINO', 'CANCELLED'],
      EN_CAMINO: ['ENTREGADO', 'CANCELLED'],
      CONFIRMED: ['ENTREGADO', 'CANCELLED'],
      ENTREGADO: [],
      CANCELLED: [],
    };

    if (!validTransitions[oldStatus]?.includes(status)) {
      throw new BadRequestException(
        `Transición de estado inválida de ${oldStatus} a ${status}`,
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status,
        deliveryContactId:
          status === 'ASIGNADO'
            ? deliveryContactId || null
            : status === 'PENDING' || status === 'EN_COLA'
              ? null
              : undefined,
      },
      include: {
        Contact: true,
        DeliveryContact: true,
        items: {
          include: {
            Product: true,
          },
        },
      },
    });

    // Gatillar notificaciones si el estado cambia
    if (oldStatus !== status) {
      if (status === 'EN_COLA') {
        await this.notifyAdminsNewOrder(organizationId, updatedOrder);
      } else if (status === 'ASIGNADO' && updatedOrder.deliveryContactId) {
        await this.notifyDeliveryAssigned(organizationId, updatedOrder);
      }
    }

    return updatedOrder;
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.order.delete({
      where: { id },
    });
  }

  private async notifyAdminsNewOrder(organizationId: string, order: any) {
    try {
      const admins = await this.prisma.operationContact.findMany({
        where: { organizationId, type: 'ADMIN' },
      });

      if (admins.length === 0) return;

      const clientName = order.Contact?.name || 'Cliente';
      const clientPhone = order.Contact?.phoneNumber || '';
      const total = order.total;
      const productsText = order.items
        .map(
          (item: any) =>
            '- ' +
            item.quantity +
            'x ' +
            (item.Product?.name || 'Producto') +
            ' (' +
            item.price +
            ' Bs)',
        )
        .join('\n');

      const address = order.shippingAddress || 'No especificada';
      const mapsLink =
        order.lat && order.lng
          ? '\\n🌍 *Ubicación GPS:* https://maps.google.com/?q=' +
            order.lat +
            ',' +
            order.lng
          : '';

      const messageText =
        '🔔 *Nuevo Pedido Confirmado (En Cola)*\n\n' +
        '👤 *Cliente:* ' +
        clientName +
        ' (' +
        clientPhone +
        ')\n' +
        '💵 *Total:* ' +
        total +
        ' Bs\n' +
        '📍 *Dirección:* ' +
        address +
        mapsLink +
        '\n\n' +
        '📦 *Productos:* \n' +
        productsText +
        '\n\n' +
        '⚠️ Ingresa a la plataforma para asignar este pedido a un repartidor.';

      for (const admin of admins) {
        const adminContact = await this.whatsappService.createContact(
          admin.name,
          admin.phoneNumber,
          organizationId,
        );
        await this.whatsappService.sendMessage(adminContact.id, messageText);
      }
    } catch (err) {
      console.error('Error al notificar a los administradores:', err);
    }
  }

  private async notifyDeliveryAssigned(organizationId: string, order: any) {
    try {
      const driver = await this.prisma.operationContact.findUnique({
        where: { id: order.deliveryContactId },
      });

      if (!driver) return;

      const clientName = order.Contact?.name || 'Cliente';
      const clientPhone = order.Contact?.phoneNumber || '';
      const total = order.total;
      const productsText = order.items
        .map(
          (item: any) =>
            '- ' +
            item.quantity +
            'x ' +
            (item.Product?.name || 'Producto') +
            ' (' +
            item.price +
            ' Bs)',
        )
        .join('\n');

      const address = order.shippingAddress || 'No especificada';
      const mapsLink =
        order.lat && order.lng
          ? '\\n🌍 *Ubicación GPS:* https://maps.google.com/?q=' +
            order.lat +
            ',' +
            order.lng
          : '';

      const messageText =
        '🛵 *Pedido Asignado para Entrega*\n\n' +
        '👤 *Cliente:* ' +
        clientName +
        ' (' +
        clientPhone +
        ')\n' +
        '📍 *Dirección de Entrega:* ' +
        address +
        mapsLink +
        '\n\n' +
        '📦 *Productos:* \n' +
        productsText +
        '\n' +
        '💵 *Monto a Cobrar:* ' +
        total +
        ' Bs\n\n' +
        '⚠️ Por favor, reporta cuando el pedido haya sido entregado.';

      const driverContact = await this.whatsappService.createContact(
        driver.name,
        driver.phoneNumber,
        organizationId,
      );
      await this.whatsappService.sendMessage(driverContact.id, messageText);
    } catch (err) {
      console.error('Error al notificar al repartidor:', err);
    }
  }
}
