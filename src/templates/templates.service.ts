import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.template.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const template = await this.prisma.template.findFirst({
      where: { id, organizationId },
    });
    if (!template) throw new NotFoundException('Plantilla no encontrada');
    return template;
  }

  async create(organizationId: string, data: { name: string; content: string; isActive?: boolean }) {
    return this.prisma.template.create({
      data: {
        ...data,
        organizationId,
      },
    });
  }

  async update(id: string, organizationId: string, data: { name?: string; content?: string; isActive?: boolean }) {
    await this.findOne(id, organizationId);
    return this.prisma.template.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.template.delete({
      where: { id },
    });
  }
}
