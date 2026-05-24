import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OperationContactsService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.operationContact.findMany({
      where: { organizationId },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const contact = await this.prisma.operationContact.findFirst({
      where: { id, organizationId },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        }
      }
    });
    if (!contact) throw new NotFoundException('Contacto de operación no encontrado');
    return contact;
  }

  async create(organizationId: string, data: any) {
    const { id, userId, ...createData } = data;
    return this.prisma.operationContact.create({
      data: {
        ...createData,
        organizationId,
        userId: userId || null
      },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        }
      }
    });
  }

  async update(id: string, organizationId: string, data: any) {
    await this.findOne(id, organizationId);
    const { userId, ...updateData } = data;
    return this.prisma.operationContact.update({
      where: { id },
      data: {
        ...updateData,
        userId: userId === undefined ? undefined : (userId || null)
      },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        }
      }
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.operationContact.delete({
      where: { id }
    });
  }
}
