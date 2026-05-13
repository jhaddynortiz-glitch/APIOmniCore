import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import 'dotenv/config';

const prisma = new PrismaClient();

// Función de encriptación duplicada para el seed para evitar errores de importación de ts-node
function encrypt(text: string): string {
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

async function main() {
  console.log('🌱 Iniciando seeding...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Crear usuario super-admin
  const user = await prisma.user.upsert({
    where: { email: 'jhaddynortiz@gmail.com' },
    update: {},
    create: {
      email: 'jhaddynortiz@gmail.com',
      password: hashedPassword,
      fullName: 'Jhaddyn Ortiz',
    },
  });
  console.log(`👤 Usuario creado/encontrado: ${user.email}`);

  // 2. Crear Organización Orizon
  const orizon = await prisma.organization.upsert({
    where: { id: 'orizon' },
    update: {},
    create: {
      id: 'orizon',
      name: 'Orizon',
      slug: 'orizon',
      whatsappToken: encrypt('EAASAjefbk5ABRHD6epeHYcZAGqdoRBvo7jwK5AZAENZAimrUPZCMXSNLBxir9UfxPZAQRjFh4ZB2KIyrHiioQrTo1RKrJ8cAETeZAh48oKPvjC2XTUWYSe339SeQ1IE7MT6msN4oA2jGQZBqHQ1AdjqFdDGO4bGr3GqDpVjhAACXZCvt6V3I6OY3fe6QFyceTZC44tKi9BVHSh57grkXT0nxVVPzyaargUCVAiZAIEPQb8L'),
      whatsappPhoneId: '1108021955722585',
      openaiApiKey: encrypt('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'),
      whatsappVerifyToken: 'omnicore_secreto_2026',
    },
  });
  console.log('🏢 Organización Orizon lista.');

  // 3. Crear Organización Camver
  const camver = await prisma.organization.upsert({
    where: { id: 'camver' },
    update: {},
    create: {
      id: 'camver',
      name: 'Camver',
      slug: 'camver',
      whatsappToken: encrypt('EAAeNt4Hl6oABRH8BEoA1PClCeUTWQXSYotZATrbdYFPCmO8r0B4Ym7wR34qnGpyvrcWNWvY803YTWRNxspT8o9slje3ZB9xi4d7ueWBhRfPxFSp6FVNNo8WGi403lbAhxnrusOBkX3Kl4qukF7yx22oYRL5Av0mmGbMbhurZCovuycIzz70ZCiCW7kQjNWEZALgZDZD'),
      whatsappPhoneId: '998199260052404',
      openaiApiKey: encrypt('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'),
      whatsappVerifyToken: 'omnicore_secreto_2026',
    },
  });
  console.log('🏢 Organización Camver lista.');

  // 4. Vincular usuario a las dos organizaciones como super-admin
  await prisma.userOrganization.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId: orizon.id } },
    update: { role: 'super-admin' },
    create: {
      userId: user.id,
      organizationId: orizon.id,
      role: 'super-admin',
    },
  });

  await prisma.userOrganization.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId: camver.id } },
    update: { role: 'super-admin' },
    create: {
      userId: user.id,
      organizationId: camver.id,
      role: 'super-admin',
    },
  });

  console.log('✅ Seeding completado con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
