import { query } from '../config/db.js';

export const getDeals = async (req, res, next) => {
  const brokerId = req.user.id;
  const { status } = req.query; 
  try {
    let sql = `
      SELECT 
        d.id, d.status, d.final_price, d.created_at,
        p.title as property_title, p.address as property_address, p.cover_image_url,
        c.name as client_name, c.phone as client_phone
      FROM deals d
      JOIN properties p ON d.property_id = p.id
      JOIN contacts c ON d.client_id = c.id
      WHERE d.broker_id = $1
    `;
    const params = [brokerId];
    let paramIndex = 2;
    if (status && status !== 'All') {
      sql += ` AND d.status = $${paramIndex}`;
      params.push(status);
    }
    sql += ` ORDER BY d.updated_at DESC`;
    const result = await query(sql, params);
    res.json({
      success: true,
      count: result.rowCount,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
};
