import { query } from '../config/db.js';

export const getDeals = async (req, res, next) => {
  const brokerId = req.user.id;
  const { status } = req.query; 
  try {
    let sql = `
      SELECT 
        d.id, d.status, d.final_price, d.created_at, d.updated_at,
        p.title as property_title, p.address as property_address, p.city, p.cover_image_url,
        c.name as client_name, c.phone as client_phone
      FROM deals d
      JOIN properties p ON d.property_id = p.id
      JOIN contacts c ON d.client_id = c.id
      WHERE d.broker_id = $1
    `;
    const params = [brokerId];
    let paramIndex = 2;
    if (status && status !== 'All') {
      if (status === 'New') {
        sql += ` AND d.status = 'Interested'`; 
      } else if (status === 'Contacted') {
        sql += ` AND d.status IN ('Contacted', 'Meeting')`; 
      } else if (status === 'Site Visit') {
        sql += ` AND d.status = 'Site Visit'`;
      } else if (status === 'Negotiation') {
        sql += ` AND d.status = 'Negotiation'`;
      } else if (status === 'Closed') {
        sql += ` AND d.status IN ('Token', 'Closed')`;
      } else {
        sql += ` AND d.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }
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