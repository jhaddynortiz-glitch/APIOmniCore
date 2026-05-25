import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { UpdateKeywordDto } from './dto/update-keyword.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KeywordService {
  constructor(private prisma: PrismaService) {}

  async create(createKeywordDto: CreateKeywordDto, organizationId: string) {
    return this.prisma.keywordTrigger.create({
      data: {
        ...createKeywordDto,
        organizationId,
      },
    });
  }

  async findAll(organizationId: string) {
    return this.prisma.keywordTrigger.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, organizationId: string) {
    const keyword = await this.prisma.keywordTrigger.findFirst({
      where: { id, organizationId },
    });
    if (!keyword) {
      throw new NotFoundException(`KeywordTrigger #${id} not found`);
    }
    return keyword;
  }

  async update(
    id: string,
    updateKeywordDto: UpdateKeywordDto,
    organizationId: string,
  ) {
    await this.findOne(id, organizationId); // ensures it exists and belongs to org
    return this.prisma.keywordTrigger.update({
      where: { id },
      data: updateKeywordDto,
    });
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);
    return this.prisma.keywordTrigger.delete({
      where: { id },
    });
  }
}
