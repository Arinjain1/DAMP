import { query } from '../config/db.js';

export const searchBrokers = async (req, res, next) => {
  const myId = req.user.id;
  const { q } = req.query; 

  try {
    const sql = `
      SELECT id, full_name, email, phone_number, operating_area, role 
      FROM users 
      WHERE id != $1 
      AND (full_name ILIKE $2 OR operating_area ILIKE $2)
      LIMIT 20
    `;
    const result = await query(sql, [myId, `%${q || ''}%`]);
    res.json({
      success: true,
      count: result.rowCount,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
};

export const sendConnectionRequest = async (req, res, next) => {
  const senderId = req.user.id;
  const { receiver_id } = req.body; 

  try {
    const existing = await query(
      `SELECT * FROM collaborations 
       WHERE (sender_id = $1 AND receiver_id = $2) 
       OR (sender_id = $2 AND receiver_id = $1)`,
      [senderId, receiver_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Request already exists (Status: ${existing.rows[0].status})` 
      });
    }
    const result = await query(
      `INSERT INTO collaborations (sender_id, receiver_id) 
       VALUES ($1, $2) 
       RETURNING *`,
      [senderId, receiver_id]
    );

    res.status(201).json({
      success: true,
      message: "Connection request sent!",
      data: result.rows[0]
    });

  } catch (err) {
    next(err);
  }
};
export const getMyNetwork = async (req, res, next) => {
  const myId = req.user.id;

  try {
    const sql = `
      SELECT u.id, u.full_name, u.email, u.phone_number, u.operating_area
      FROM collaborations c
      JOIN users u ON (u.id = c.sender_id OR u.id = c.receiver_id)
      WHERE (c.sender_id = $1 OR c.receiver_id = $1)
      AND c.status = 'accepted'
      AND u.id != $1
    `;

    const result = await query(sql, [myId]);

    res.json({
      success: true,
      count: result.rowCount,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
};