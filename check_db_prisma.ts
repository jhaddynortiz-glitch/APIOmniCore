import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
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
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        lastActiveOrganizationId: true,
        organizations: {
          select: {
            organizationId: true,
            role: true
          }
        }
      }
    });
    console.log('=== USUARIOS Y SU ORG ACTIVA ===');
    console.log(JSON.stringify(users, null, 2));

    const orgs = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        isDeliveryEnabled: true,
        isLocalEnabled: true,
        isMeetingEnabled: true
      }
    });
    console.log('=== ORGANIZACIONES ===');
    console.log(JSON.stringify(orgs, null, 2));
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
