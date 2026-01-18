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
  }
});
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to Supabase PostgreSQL Database');
    client.release(); 
  } catch (err) {
    console.error('❌ Database Connection Error:', err.stack);
    process.exit(1); 
  }
};

testConnection();
export const query = (text, params) => pool.query(text, params);