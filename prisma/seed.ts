import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando el proceso de seeding (población de datos)...');

  // 1. Crear Organización por defecto
  const organization = await prisma.organization.upsert({
    where: { slug: 'omnicore-demo' },
    update: {},
    create: {
      id: 'org_demo_1',
      name: 'OmniCore Demo Company',
      slug: 'omnicore-demo',
    },
  });

  console.log(`✅ Organización creada: ${organization.name}`);

  // 2. Crear un usuario agente
  const user = await prisma.user.upsert({
    where: { email: 'agente@omnicore.com' },
    update: {},
    create: {
      id: 'usr_agent_1',
      email: 'agente@omnicore.com',
      fullName: 'Agente de Ventas 1',
      role: 'vendedor',
      organizationId: organization.id,
    },
  });

  console.log(`✅ Usuario creado: ${user.email}`);

  // 3. Crear Contactos Falsos
  const contactsData = [
    { phone: '5215551234567', name: 'Laura Martinez' },
    { phone: '5491119876543', name: 'Carlos Gomez' },
    { phone: '34600112233', name: 'Miguel Torres' },
    { phone: '573009998877', name: 'Ana Silva' }
  ];

  for (const contactData of contactsData) {
    const contact = await prisma.contact.upsert({
      where: {
        organizationId_phoneNumber: {
          organizationId: organization.id,
          phoneNumber: contactData.phone,
        },
      },
      update: {},
      create: {
        phoneNumber: contactData.phone,
        name: contactData.name,
        organizationId: organization.id,
      },
    });

    console.log(`✅ Contacto creado: ${contact.name} (${contact.phoneNumber})`);

    // 4. Crear algunos mensajes falsos para cada contacto
    await prisma.message.createMany({
       data: [
         {
           body: 'Hola, me gustaría información sobre el CRM.',
           isFromMe: false,
           type: 'text',
           contactId: contact.id,
         },
         {
           body: `¡Hola ${contact.name}! Claro, un agente te atenderá en seguida.`,
           isFromMe: true,
           type: 'text',
           contactId: contact.id,
         },
       ]
    });
  }

  console.log('🎉 ¡Base de datos poblada exitosamente!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
