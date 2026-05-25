import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { encrypt, decrypt } from '../common/utils/crypto.util';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!org) {
      throw new NotFoundException('Organización no encontrada');
    }

    // Desencriptar campos sensibles para el frontend (o manejarlos con asteriscos)
    return {
      ...org,
      whatsappToken: org.whatsappToken ? decrypt(org.whatsappToken) : '',
      openaiApiKey: org.openaiApiKey ? decrypt(org.openaiApiKey) : '',
      googleClientSecret: org.googleClientSecret
        ? decrypt(org.googleClientSecret)
        : '',
    };
  }

  async update(id: string, data: any) {
    // Solo permitimos actualizar campos específicos para evitar errores de Prisma con IDs o relaciones
    const allowedFields = [
      'name',
      'whatsappToken',
      'whatsappPhoneId',
      'whatsappVerifyToken',
      'openaiApiKey',
      'googleClientId',
      'googleClientSecret',
      'logoUrl',
      'isDeliveryEnabled',
      'isLocalEnabled',
      'isMeetingEnabled',
    ];

    const updateData: any = {};

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        let value = data[key];

        // Encriptar si es un campo sensible
        if (
          ['whatsappToken', 'openaiApiKey', 'googleClientSecret'].includes(
            key,
          ) &&
          value
        ) {
          // Solo encriptar si no parece estar ya encriptado (para evitar doble encriptación)
          if (!value.includes(':')) {
            value = encrypt(value);
          }
        }

        updateData[key] = value;
      }
    }

    return this.prisma.organization.update({
      where: { id },
      data: updateData,
    });
  }
}
