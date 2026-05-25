import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    organizationId: string,
    filters?: { categoryId?: string; subcategoryId?: string; search?: string },
  ) {
    const where: any = { organizationId };

    if (filters?.subcategoryId) {
      where.subcategoryId = filters.subcategoryId;
    } else if (filters?.categoryId) {
      // Si solo hay id de categoría, filtramos productos de todas sus subcategorías
      where.Subcategory = { categoryId: filters.categoryId };
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        {
          triggers: {
            some: {
              keyword: { contains: filters.search, mode: 'insensitive' },
            },
          },
        },
      ];
    }

    return this.prisma.product.findMany({
      where,
      include: {
        ads: true,
        triggers: true,
        Subcategory: {
          include: { Category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, organizationId },
      include: {
        ads: true,
        triggers: true,
        Subcategory: {
          include: { Category: true },
        },
      },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async create(organizationId: string, data: any) {
    const { id, ads, triggers, ...createData } = data;

    return this.prisma.product.create({
      data: {
        ...createData,
        organizationId,
        ads:
          ads && ads.length > 0
            ? {
                create: ads.map((ad: any) => ({
                  adId: ad.adId,
                  platform: ad.platform || 'meta',
                })),
              }
            : undefined,
        triggers:
          triggers && triggers.length > 0
            ? {
                create: triggers.map((t: any) => ({
                  keyword: t.keyword,
                  response: t.response,
                })),
              }
            : undefined,
      },
      include: {
        ads: true,
        triggers: true,
      },
    });
  }

  async update(id: string, organizationId: string, data: any) {
    await this.findOne(id, organizationId);

    const { ads, triggers, ...updateData } = data;

    // Si envían ads, borramos los anteriores y creamos los nuevos
    const adsOperation = ads
      ? {
          deleteMany: {},
          create: ads.map((ad: any) => ({
            adId: ad.adId,
            platform: ad.platform || 'meta',
          })),
        }
      : undefined;

    // Si envían triggers, borramos los anteriores y creamos los nuevos
    const triggersOperation = triggers
      ? {
          deleteMany: {},
          create: triggers.map((t: any) => ({
            keyword: t.keyword,
            response: t.response,
          })),
        }
      : undefined;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        ...(adsOperation ? { ads: adsOperation } : {}),
        ...(triggersOperation ? { triggers: triggersOperation } : {}),
      },
      include: {
        ads: true,
        triggers: true,
      },
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.product.delete({
      where: { id },
    });
  }

  // Método especial para el bot de IA (solo activos)
  async findAllActiveForGpt(organizationId: string) {
    return this.prisma.product.findMany({
      where: { organizationId, isActive: true },
      include: {
        Subcategory: {
          include: { Category: true },
        },
      },
      orderBy: [
        { Subcategory: { Category: { name: 'asc' } } },
        { Subcategory: { name: 'asc' } },
        { name: 'asc' },
      ],
    });
  }
}
