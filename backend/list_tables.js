import { pool } from './config/db.js';

async function listTables() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    `);
    console.log('Tables found in database:', res.rows.map(r => r.table_name));
  } catch (err) {
    console.error('Error listing tables:', err);
  } finally {
    await pool.end();
  }
}

listTables();
