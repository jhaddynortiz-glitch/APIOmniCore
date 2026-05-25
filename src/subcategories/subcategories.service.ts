import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubcategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.subcategory.findMany({
      where: { organizationId },
      include: { Category: true },
      orderBy: { name: 'asc' },
    });
  }

  async findByCategoryId(categoryId: string, organizationId: string) {
    return this.prisma.subcategory.findMany({
      where: { categoryId, organizationId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const sub = await this.prisma.subcategory.findFirst({
      where: { id, organizationId },
      include: { Category: true },
    });
    if (!sub) throw new NotFoundException('Subcategoría no encontrada');
    return sub;
  }

  async create(
    organizationId: string,
    data: { name: string; categoryId: string; id?: string },
  ) {
    const { id, ...createData } = data;
    return this.prisma.subcategory.create({
      data: {
        ...createData,
        organizationId,
      },
    });
  }

  async update(
    id: string,
    organizationId: string,
    data: { name: string; categoryId: string },
  ) {
    await this.findOne(id, organizationId);
    return this.prisma.subcategory.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.subcategory.delete({
      where: { id },
    });
  }
}
