import { query } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runFix() {
  try {
    
    
    const sqlFile = path.join(__dirname, 'fix_column_types.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        
        await query(statement);
      }
    }
    
    
    // Verify
    const result = await query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_name = 'contacts' 
      AND column_name IN ('selected_properties', 'interested_properties', 'hold_properties')
    `);
    
    
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (${row.udt_name})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

runFix();
