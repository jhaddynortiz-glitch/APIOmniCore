const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_QmGf0SyeAgh2@ep-late-morning-ampll61o.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function main() {
  try {
    const res = await pool.query('SELECT id, name, "imageUrl", "isActive" FROM "Product" LIMIT 20');
    console.log('=== PRODUCTOS EN LA DB ===');
    console.log(JSON.stringify(res.rows, null, 2));
    console.log(`Total: ${res.rows.length} productos`);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}

main();
