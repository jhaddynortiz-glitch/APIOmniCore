import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.category.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, organizationId },
    });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return category;
  }

  async create(organizationId: string, data: { name: string; id?: string }) {
    const { id, ...createData } = data;
    return this.prisma.category.create({
      data: {
        ...createData,
        organizationId,
      },
    });
  }

  async update(id: string, organizationId: string, data: { name: string }) {
    await this.findOne(id, organizationId);
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
