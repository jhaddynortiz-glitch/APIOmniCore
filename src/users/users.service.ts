import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOneByEmail(email: string): Promise<any | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        organizations: {
          include: { Organization: true },
        },
      },
    });
  }

  async findOneById(id: string): Promise<any | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        organizations: {
          include: { Organization: true },
        },
      },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async checkUserExists(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, fullName: true, globalRole: true },
    });
    return { exists: !!user, user };
  }

  async addUserToOrganization(
    email: string,
    role: string,
    organizationId: string,
  ): Promise<any> {
    // 1. Verificar que el usuario exista en la plataforma
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(
        'Este usuario no está registrado en la plataforma. Debe registrarse primero.',
      );
    }

    // 1.5. Verificar que el usuario no sea SUPER_ADMIN
    if (user.globalRole === 'SUPER_ADMIN') {
      throw new ConflictException(
        'No se puede invitar a un Super Admin a una organización, ya tienen acceso total.',
      );
    }

    // 2. Verificar que no esté ya en la organización
    const existing = await this.prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'Este usuario ya pertenece a esta organización.',
      );
    }

    // 3. Crear la vinculación con estado "pending"
    const membership = await this.prisma.userOrganization.create({
      data: {
        userId: user.id,
        organizationId,
        role,
        status: 'pending',
      },
      include: {
        User: { select: { id: true, email: true, fullName: true } },
        Organization: { select: { name: true } },
      },
    });

    return membership;
  }

  async updateOrgMember(
    userId: string,
    organizationId: string,
    data: { role?: string; status?: string },
  ) {
    const membership = await this.prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });

    if (!membership) {
      throw new NotFoundException('Miembro no encontrado en la organización.');
    }

    return this.prisma.userOrganization.update({
      where: {
        userId_organizationId: { userId, organizationId },
      },
      data: {
        ...(data.role && { role: data.role }),
        ...(data.status && { status: data.status }),
      },
      include: {
        User: { select: { id: true, email: true, fullName: true } },
      },
    });
  }

  async removeOrgMember(userId: string, organizationId: string) {
    const membership = await this.prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });

    if (!membership) {
      throw new NotFoundException('Miembro no encontrado en la organización.');
    }

    return this.prisma.userOrganization.delete({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });
  }

  async getOrgMembers(organizationId: string) {
    return this.prisma.userOrganization.findMany({
      where: {
        organizationId,
        User: {
          globalRole: { not: 'SUPER_ADMIN' },
        },
      },
      include: {
        User: {
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
            globalRole: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyInvitations(userId: string) {
    return this.prisma.userOrganization.findMany({
      where: { userId, status: 'pending' },
      include: {
        Organization: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async acceptInvitation(userId: string, organizationId: string) {
    const membership = await this.prisma.userOrganization.findUnique({
      where: {
        userId_organizationId: { userId, organizationId },
      },
    });

    if (!membership) {
      throw new NotFoundException('Invitación no encontrada.');
    }

    if (membership.status === 'active') {
      throw new ConflictException(
        'Ya eres miembro activo de esta organización.',
      );
    }

    return this.prisma.userOrganization.update({
      where: {
        userId_organizationId: { userId, organizationId },
      },
      data: { status: 'active' },
      include: {
        Organization: { select: { id: true, name: true } },
      },
    });
  }

  async getMyMemberships(userId: string) {
    return this.prisma.userOrganization.findMany({
      where: { userId },
      include: {
        Organization: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllPlatformOrganizations() {
    return this.prisma.organization.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
