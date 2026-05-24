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
    const orgs = await prisma.organization.findMany();
    orgs.forEach(o => {
      console.log(`Org: ${o.name} (${o.id})`);
      console.log(`- whatsappToken: ${o.whatsappToken ? 'SET (' + o.whatsappToken.substring(0, 15) + '...)' : 'NULL'}`);
      console.log(`- whatsappPhoneId: ${o.whatsappPhoneId}`);
      console.log(`- openaiApiKey: ${o.openaiApiKey ? 'SET (' + o.openaiApiKey.substring(0, 15) + '...)' : 'NULL'}`);
    });
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
