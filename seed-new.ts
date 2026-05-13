import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando la carga de datos (Seeding)...');
  
  const email = 'jhaddynortiz@gmail.com';
  const plainPassword = 'Test12345';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // 1. Crear el usuario Super Admin
  const user = await prisma.user.upsert({
    where: { email },
    update: { 
      globalRole: 'SUPER_ADMIN',
      password: hashedPassword 
    },
    create: {
      email,
      password: hashedPassword,
      fullName: 'Jhaddyn Ortiz',
      globalRole: 'SUPER_ADMIN'
    },
  });
  console.log('✅ Usuario Super Admin creado:', user.email);

  // 2. Crear las organizaciones
  const orizon = await prisma.organization.upsert({
    where: { slug: 'orizon' },
    update: { name: 'Orizon' },
    create: {
      id: 'orizon-id',
      name: 'Orizon',
      slug: 'orizon',
    },
  });
  console.log('✅ Organización creada:', orizon.name);

  const polivitaminas = await prisma.organization.upsert({
    where: { slug: 'polivitaminas' },
    update: { name: 'PoliVitaminas' },
    create: {
      id: 'polivitaminas-id',
      name: 'PoliVitaminas',
      slug: 'polivitaminas',
    },
  });
  console.log('✅ Organización creada:', polivitaminas.name);

  // 3. Vincular el usuario a las organizaciones
  await prisma.userOrganization.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId: orizon.id } },
    update: { role: 'admin', status: 'active' },
    create: { userId: user.id, organizationId: orizon.id, role: 'admin', status: 'active' },
  });

  await prisma.userOrganization.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId: polivitaminas.id } },
    update: { role: 'admin', status: 'active' },
    create: { userId: user.id, organizationId: polivitaminas.id, role: 'admin', status: 'active' },
  });

  console.log('🎉 ¡Datos insertados correctamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error al insertar datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
