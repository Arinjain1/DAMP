import { query } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('Running migration: add_selected_properties.sql');
    
    const sqlFile = path.join(__dirname, 'add_selected_properties.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    await query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('Added columns: selected_properties, interested_properties, hold_properties');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
