import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise(resolve => rl.question(query, resolve));
};

async function main() {
  console.log('👤 --- Herramienta para Crear Nuevos Usuarios --- 👤\n');

  const email = await question('✉️  Correo electrónico del nuevo usuario: ');
  const password = await question('🔑 Contraseña: ');
  const fullName = await question('📝 Nombre completo: ');
  const roleInput = await question('⭐ ¿Hacerlo Super Admin? (si/no) [no]: ');
  const isSuperAdmin = roleInput.toLowerCase().trim() === 'si' || roleInput.toLowerCase().trim() === 's';
  const orgSlug = await question('🏢 ID de la organización para vincularlo (ej. orizon, polivitaminas) [dejar en blanco si no quieres vincularlo]: ');

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: { 
      password: hashedPassword,
      fullName,
      globalRole: isSuperAdmin ? 'SUPER_ADMIN' : 'NONE'
    },
    create: {
      email,
      password: hashedPassword,
      fullName,
      globalRole: isSuperAdmin ? 'SUPER_ADMIN' : 'NONE'
    },
  });

  console.log(`\n✅ Usuario creado exitosamente: ${user.email}`);

  if (orgSlug.trim() !== '') {
    const org = await prisma.organization.findUnique({ where: { slug: orgSlug.trim() } });
    if (org) {
      await prisma.userOrganization.upsert({
        where: { userId_organizationId: { userId: user.id, organizationId: org.id } },
        update: { role: 'user', status: 'active' },
        create: { userId: user.id, organizationId: org.id, role: 'user', status: 'active' },
      });
      console.log(`✅ Usuario vinculado a la organización: ${org.name}`);
    } else {
      console.log(`⚠️ No se encontró ninguna organización con el ID: ${orgSlug.trim()}. El usuario fue creado, pero no vinculado.`);
    }
  }

  console.log('\n🎉 ¡Proceso terminado!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
  })
  .finally(async () => {
    rl.close();
    await prisma.$disconnect();
    await pool.end();
  });
