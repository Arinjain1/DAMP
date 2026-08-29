import { pool } from './config/db.js';

const tables = [
  'users',             'property_images',
  'contacts',          'tasks',
  'properties',        'collaborations',
  'deal_transactions', 'deals',
  'site_visit_items',  'site_visits',
  'subscriptions',     'payment_history',
  'collab_visits',     'collab_rooms',
  'collab_tasks'
];

async function clearDB() {
  try {
    console.log('Starting full database reset...');
    // Generate a single query to truncate all tables with CASCADE
    const truncateQuery = `TRUNCATE TABLE ${tables.map(t => `"${t}"`).join(', ')} CASCADE;`;
    
    await pool.query(truncateQuery);
    console.log('✅ All tables truncated successfully (data cleared, tables kept).');
  } catch (err) {
    console.error('❌ Error clearing database:', err);
  } finally {
    await pool.end();
  }
}

clearDB();
