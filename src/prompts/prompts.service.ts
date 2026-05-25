import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromptsService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.prompt.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const prompt = await this.prisma.prompt.findFirst({
      where: { id, organizationId },
    });
    if (!prompt) throw new NotFoundException('Prompt no encontrado');
    return prompt;
  }

  async create(organizationId: string, data: any) {
    // Si este prompt es marcado como activo, desactivar los demás de esta organización
    if (data.isActive) {
      await this.prisma.prompt.updateMany({
        where: { organizationId, isActive: true },
        data: { isActive: false },
      });
    }

    const { id, ...createData } = data;

    return this.prisma.prompt.create({
      data: {
        ...createData,
        organizationId,
      },
    });
  }

  async update(id: string, organizationId: string, data: any) {
    await this.findOne(id, organizationId);

    if (data.isActive) {
      await this.prisma.prompt.updateMany({
        where: { organizationId, isActive: true, NOT: { id } },
        data: { isActive: false },
      });
    }

    return this.prisma.prompt.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.prompt.delete({
      where: { id },
    });
  }

  async getActivePrompt(organizationId: string) {
    return this.prisma.prompt.findFirst({
      where: { organizationId, isActive: true },
    });
  }
}
