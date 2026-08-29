import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("FATAL ERROR: DATABASE_URL is missing in .env file");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 4,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000
});

const testConnection = async () => {
  try {
    const client = await pool.connect();

    console.log('✅ Database Connected Successfully');

    await client.query(`
      ALTER TABLE collab_rooms 
      ADD COLUMN IF NOT EXISTS last_proposed_by UUID REFERENCES users(id) ON DELETE SET NULL
    `);

    await client.query(`
      ALTER TABLE collab_rooms 
      ADD COLUMN IF NOT EXISTS counter_note TEXT
    `);

    await client.query(`
      ALTER TABLE properties 
      ADD COLUMN IF NOT EXISTS house_no VARCHAR(255),
      ADD COLUMN IF NOT EXISTS landmark VARCHAR(255),
      ADD COLUMN IF NOT EXISTS pincode VARCHAR(20)
    `);

    await client.query(`
      ALTER TABLE contacts 
      ADD COLUMN IF NOT EXISTS city VARCHAR(100),
      ADD COLUMN IF NOT EXISTS state VARCHAR(100),
      ADD COLUMN IF NOT EXISTS pincode VARCHAR(20)
    `);

    await client.query(`
      UPDATE collab_rooms 
      SET last_proposed_by = broker_1_id 
      WHERE last_proposed_by IS NULL
    `);

    client.release();
  } catch (err) {
    console.error('❌ Database Connection Error:', err.stack);
  }
};

testConnection();

export const query = (text, params) => pool.query(text, params);
export { pool };