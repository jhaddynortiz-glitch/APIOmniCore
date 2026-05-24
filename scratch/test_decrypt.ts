import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
dotenv.config();

const ALGORITHM = 'aes-256-cbc';
const RAW_KEY = process.env.CRYPTO_KEY || 'omnicore_secure_32_byte_key_auth'; 
const ENCRYPTION_KEY = crypto.createHash('sha256').update(RAW_KEY).digest();

function decrypt(text: string): string {
  if (!text || !text.includes(':')) return text;
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const o = await prisma.organization.findUnique({
      where: { id: 'polivitaminas-id' }
    });
    if (!o) {
      console.log('Org not found');
      return;
    }
    console.log('whatsappPhoneId:', o.whatsappPhoneId);
    try {
      console.log('decrypted whatsappToken:', o.whatsappToken ? decrypt(o.whatsappToken).substring(0, 15) + '...' : 'NULL');
    } catch (e) {
      console.error('Failed to decrypt whatsappToken:', e.message);
    }
    try {
      console.log('decrypted openaiApiKey:', o.openaiApiKey ? decrypt(o.openaiApiKey).substring(0, 15) + '...' : 'NULL');
    } catch (e) {
      console.error('Failed to decrypt openaiApiKey:', e.message);
    }
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
