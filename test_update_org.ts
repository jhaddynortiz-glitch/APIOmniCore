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
  const orgId = 'orizon-id'; // Let's check first organization
  try {
    console.log('UPDATING ORG IN DATABASE...');
    const updated = await prisma.organization.update({
      where: { id: orgId },
      data: {
        isDeliveryEnabled: true,
        isLocalEnabled: true,
        isMeetingEnabled: true
      }
    });
    console.log('Update result:', {
      id: updated.id,
      name: updated.name,
      isDeliveryEnabled: updated.isDeliveryEnabled,
      isLocalEnabled: updated.isLocalEnabled,
      isMeetingEnabled: updated.isMeetingEnabled
    });

    console.log('READING BACK FROM DB...');
    const read = await prisma.organization.findUnique({
      where: { id: orgId }
    });
    console.log('Read result:', {
      id: read?.id,
      name: read?.name,
      isDeliveryEnabled: read?.isDeliveryEnabled,
      isLocalEnabled: read?.isLocalEnabled,
      isMeetingEnabled: read?.isMeetingEnabled
    });

    // Reset back to false for clean state
    console.log('RESETTING ORG TO FALSE...');
    await prisma.organization.update({
      where: { id: orgId },
      data: {
        isDeliveryEnabled: false,
        isLocalEnabled: false,
        isMeetingEnabled: false
      }
    });
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
