import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  async create(organizationId: string, data: { id?: string; name: string; content: string; isActive?: boolean }) {
    const { id, ...templateData } = data;

    if (templateData.name && /\s/.test(templateData.name)) {
      throw new BadRequestException('El nombre de la plantilla no puede contener espacios');
    }

    const existing = await this.prisma.template.findFirst({
      where: {
        organizationId,
        name: {
          equals: templateData.name,
          mode: 'insensitive'
        }
      }
    });

    if (existing) {
      throw new BadRequestException('Ya existe una plantilla con este nombre');
    }

    return this.prisma.template.create({
      data: {
        ...templateData,
        organizationId,
      },
    });
  }

  async update(id: string, organizationId: string, data: { name?: string; content?: string; isActive?: boolean }) {
    await this.findOne(id, organizationId);

    if (data.name) {
      if (/\s/.test(data.name)) {
        throw new BadRequestException('El nombre de la plantilla no puede contener espacios');
      }

      const existing = await this.prisma.template.findFirst({
        where: {
          organizationId,
          name: {
            equals: data.name,
            mode: 'insensitive'
          },
          NOT: { id }
        }
      });

      if (existing) {
        throw new BadRequestException('Ya existe una plantilla con este nombre');
      }
    }

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
