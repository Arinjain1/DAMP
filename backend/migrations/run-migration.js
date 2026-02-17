import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    
    // Read the SQL file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const sqlPath = join(__dirname, 'add_profile_image_column.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    
    // Execute the migration
    await client.query(sql);
    
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
