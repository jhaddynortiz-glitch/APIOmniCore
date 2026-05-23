import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Migrando IDs de anuncios...');
  
  // Buscar productos que tengan el campo facebookAdId (no nulo y no vacío)
  const productsWithAds = await prisma.product.findMany({
    where: {
      facebookAdId: {
        not: null,
      }
    }
  });

  console.log(`Encontrados ${productsWithAds.length} productos con IDs antiguos.`);

  let migratedCount = 0;

  for (const product of productsWithAds) {
    if (!product.facebookAdId || product.facebookAdId.trim() === '') continue;

    // Los IDs antiguos pueden estar separados por comas
    const adIds = product.facebookAdId.split(',').map(id => id.trim()).filter(id => id.length > 0);

    for (const adId of adIds) {
      // Verificar si ya existe para evitar duplicados en caso de ejecutar múltiples veces
      const existing = await prisma.productAd.findFirst({
        where: {
          adId: adId,
          productId: product.id
        }
      });

      if (!existing) {
        await prisma.productAd.create({
          data: {
            adId: adId,
            platform: 'meta', // Por defecto todos los antiguos venían de Facebook Ads
            productId: product.id
          }
        });
        migratedCount++;
      }
    }
  }

  console.log(`Migración completada. Se crearon ${migratedCount} nuevos registros en ProductAd.`);
}

main()
  .catch((e) => {
    console.error('Error durante la migración:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
