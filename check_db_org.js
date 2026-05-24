const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgresql://postgres:omnicore60969@omnicore-db.cbcsgcs6g2r1.us-east-2.rds.amazonaws.com:5432/omnicore?schema=public"
});

async function main() {
  try {
    const res = await pool.query('SELECT id, name, "isDeliveryEnabled", "isLocalEnabled", "isMeetingEnabled" FROM "Organization"');
    console.log('=== ORGANIZACIONES EN LA DB ===');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}

main();
