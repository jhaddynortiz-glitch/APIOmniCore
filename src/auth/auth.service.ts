import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        organizations: {
          include: { Organization: true }
        }
      }
    });

    let orgs = [];
    if (dbUser?.globalRole === 'SUPER_ADMIN') {
      // Si es Super Admin Global, ve TODAS las organizaciones
      const allOrgs = await this.prisma.organization.findMany();
      orgs = allOrgs.map(o => ({
        id: o.id,
        name: o.name,
        role: 'super-admin' // Actúa como super-admin en todas
      }));
    } else {
      orgs = dbUser?.organizations
        .filter(uo => uo.status === 'active')
        .map(uo => ({
          id: uo.organizationId,
          name: uo.Organization.name,
          role: uo.role
        })) || [];
    }

    // Priorizar la última organización activa si existe y sigue siendo válida
    let activeOrg = orgs.find(o => o.id === dbUser?.lastActiveOrganizationId) || orgs[0] || null;

    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: activeOrg?.role || 'user',
      orgId: activeOrg?.id || null,
      globalRole: dbUser?.globalRole || 'NONE'
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        activeRole: activeOrg?.role || 'user',
        activeOrganizationId: activeOrg?.id || null,
        globalRole: dbUser?.globalRole || 'NONE',
        organizations: orgs
      },
    };
  }

  async register(data: any) {
    const existing = await this.usersService.findOneByEmail(data.email);
    if (existing) {
      throw new ConflictException('El correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.usersService.create({
      email: data.email,
      password: hashedPassword,
      fullName: data.fullName,
    });

    return this.login(user);
  }

  async validateGoogleUser(profile: any) {
    const { id, emails, displayName, photos } = profile;
    const email = emails[0].value;
    
    let user = await this.usersService.findOneByEmail(email);

    if (!user) {
      const orgId = `org_${Math.random().toString(36).substring(7)}`;
      const org = await this.prisma.organization.create({
        data: {
          id: orgId,
          name: `Organización de ${displayName || email}`,
          slug: orgId,
        },
      });

      user = await this.usersService.create({
        email,
        googleId: id,
        fullName: displayName,
        avatarUrl: photos?.[0]?.value,
        organizations: {
          create: {
            organizationId: org.id,
            role: 'admin'
          }
        }
      });
    } else if (!user.googleId) {
      user = await this.usersService.update(user.id, {
        googleId: id,
        avatarUrl: photos?.[0]?.value,
      });
    }

    return user;
  }

  async switchOrganization(userId: string, targetOrgId: string) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        organizations: {
          include: { Organization: true }
        }
      }
    });

    if (!dbUser) throw new UnauthorizedException('Usuario no encontrado');

    let membership = dbUser.organizations.find(uo => uo.organizationId === targetOrgId);
    let role = membership?.role || 'user';
    let targetOrgName = membership?.Organization.name;

    // Si es Super Admin Global, puede entrar aunque no esté vinculado
    if (dbUser.globalRole === 'SUPER_ADMIN' && !membership) {
      const org = await this.prisma.organization.findUnique({ where: { id: targetOrgId } });
      if (!org) throw new UnauthorizedException('Organización no existe');
      role = 'super-admin';
      targetOrgName = org.name;
    } else if (!membership) {
      throw new UnauthorizedException('No perteneces a esta organización');
    } else if (membership.status === 'pending' && dbUser.globalRole !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Debes aceptar la invitación primero');
    }

    let orgs = [];
    if (dbUser.globalRole === 'SUPER_ADMIN') {
      const allOrgs = await this.prisma.organization.findMany();
      orgs = allOrgs.map(o => ({
        id: o.id,
        name: o.name,
        role: 'super-admin'
      }));
    } else {
      orgs = dbUser.organizations
        .filter(uo => uo.status === 'active')
        .map(uo => ({
          id: uo.organizationId,
          name: uo.Organization.name,
          role: uo.role
        }));
    }

    // Guardar la elección para persistencia
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastActiveOrganizationId: targetOrgId }
    });

    const payload = { 
      sub: userId, 
      email: dbUser.email, 
      role: role,
      orgId: targetOrgId,
      globalRole: dbUser.globalRole
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userId,
        email: dbUser.email,
        fullName: dbUser.fullName,
        activeRole: role,
        activeOrganizationId: targetOrgId,
        globalRole: dbUser.globalRole,
        organizations: orgs
      },
    };
  }

  async forceSeed() {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const email = 'jhaddynortiz@gmail.com';

    // 1. Super admin user (GLOBAL)
    const user = await this.prisma.user.upsert({
      where: { email },
      update: { globalRole: 'SUPER_ADMIN' },
      create: {
        email,
        password: hashedPassword,
        fullName: 'Jhaddyn Ortiz',
        globalRole: 'SUPER_ADMIN'
      },
    });

    // 2. Orizon
    await this.prisma.organization.upsert({
      where: { id: 'orizon' },
      update: {},
      create: {
        id: 'orizon',
        name: 'Orizon',
        slug: 'orizon',
        whatsappToken: this.encrypt('EAASAjefbk5ABRHD6epeHYcZAGqdoRBvo7jwK5AZAENZAimrUPZCMXSNLBxir9UfxPZAQRjFh4ZB2KIyrHiioQrTo1RKrJ8cAETeZAh48oKPvjC2XTUWYSe339SeQ1IE7MT6msN4oA2jGQZBqHQ1AdjqFdDGO4bGr3GqDpVjhAACXZCvt6V3I6OY3fe6QFyceTZC44tKi9BVHSh57grkXT0nxVVPzyaargUCVAiZAIEPQb8L'),
        whatsappPhoneId: '1108021955722585',
        openaiApiKey: this.encrypt('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'),
        whatsappVerifyToken: 'omnicore_secreto_2026',
      },
    });

    // 3. Camver
    await this.prisma.organization.upsert({
      where: { id: 'camver' },
      update: {},
      create: {
        id: 'camver',
        name: 'Camver',
        slug: 'camver',
        whatsappToken: this.encrypt('EAAeNt4Hl6oABRH8BEoA1PClCeUTWQXSYotZATrbdYFPCmO8r0B4Ym7wR34qnGpyvrcWNWvY803YTWRNxspT8o9slje3ZB9xi4d7ueWBhRfPxFSp6FVNNo8WGi403lbAhxnrusOBkX3Kl4qukF7yx22oYRL5Av0mmGbMbhurZCovuycIzz70ZCiCW7kQjNWEZALgZDZD'),
        whatsappPhoneId: '998199260052404', 
        openaiApiKey: this.encrypt('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'),
        whatsappVerifyToken: 'omnicore_secreto_2026',
      },
    });

    // 4. Link user to both (aunque sea super admin global, lo dejamos vinculado para redundancia)
    await this.prisma.userOrganization.upsert({
      where: { userId_organizationId: { userId: user.id, organizationId: 'orizon' } },
      update: { role: 'admin' },
      create: { userId: user.id, organizationId: 'orizon', role: 'admin' },
    });

    await this.prisma.userOrganization.upsert({
      where: { userId_organizationId: { userId: user.id, organizationId: 'camver' } },
      update: { role: 'admin' },
      create: { userId: user.id, organizationId: 'camver', role: 'admin' },
    });

    // 5. Otros usuarios solicitados
    const usersToCreate = [
      { email: 'piromanojhadder@gmail.com', role: 'admin', org: 'orizon' },
      { email: 'maria@test.com', role: 'user', org: 'camver' }
    ];

    for (const u of usersToCreate) {
      const newUser = await this.prisma.user.upsert({
        where: { email: u.email },
        update: { globalRole: 'NONE' },
        create: {
          email: u.email,
          password: hashedPassword,
          fullName: u.email.split('@')[0],
          globalRole: 'NONE'
        }
      });

      await this.prisma.userOrganization.upsert({
        where: { userId_organizationId: { userId: newUser.id, organizationId: u.org } },
        update: { role: u.role },
        create: {
          userId: newUser.id,
          organizationId: u.org,
          role: u.role,
        }
      });
    }

    return { success: true, message: 'Seeding completado con Global Roles.' };
  }

  async clearChats() {
    const deletedMessages = await this.prisma.message.deleteMany({});
    const deletedContacts = await this.prisma.contact.deleteMany({});
    return {
      success: true,
      message: `Eliminados ${deletedMessages.count} mensajes y ${deletedContacts.count} contactos.`
    };
  }

  async migrateContacts() {
    const OLD_ORG_ID = '359b8d14-5cbb-47bc-93a1-052bb9f59e2d'; // OmniCore Demo
    const NEW_ORG_ID = 'orizon';

    // Contar contactos antes
    const contactsBefore = await this.prisma.contact.count({
      where: { organizationId: OLD_ORG_ID }
    });

    if (contactsBefore === 0) {
      return { success: true, message: 'No hay contactos para migrar.' };
    }

    // Migrar todos los contactos de OmniCore Demo a Orizon
    const result = await this.prisma.contact.updateMany({
      where: { organizationId: OLD_ORG_ID },
      data: { organizationId: NEW_ORG_ID }
    });

    return {
      success: true,
      message: `Migrados ${result.count} contactos de OmniCore Demo → Orizon.`
    };
  }

  private encrypt(text: string): string {
    const ALGORITHM = 'aes-256-cbc';
    const ENCRYPTION_KEY = process.env.CRYPTO_KEY || 'omnicore_secure_32_byte_key_auth'; 
    const IV_LENGTH = 16;
    
    if (!text) return text;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }
}
