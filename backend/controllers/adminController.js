import { query } from '../config/db.js';

// 1. Get Dashboard Stats
export const getStats = async (req, res, next) => {
  try {
    // Total Brokers count
    const brokersCountRes = await query(
      "SELECT COUNT(*) FROM users WHERE role = 'broker'"
    );
    const totalBrokers = parseInt(brokersCountRes.rows[0].count, 10);

    // Active Pro Plans count (non-trial active subscriptions)
    const activeProPlansRes = await query(
      "SELECT COUNT(*) FROM subscriptions WHERE plan_name != 'trial' AND status = 'active' AND valid_until > NOW()"
    );
    const activeProPlans = parseInt(activeProPlansRes.rows[0].count, 10);

    // Monthly Revenue (current calendar month sum from payment_history)
    const monthlyRevRes = await query(`
      SELECT SUM(amount_inr) as total_rev 
      FROM payment_history 
      WHERE status = 'success' 
      AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `);
    const monthlyRevenue = parseFloat(monthlyRevRes.rows[0].total_rev || 0);

    // Pending Properties count for moderation
    const pendingPropertiesRes = await query(
      "SELECT COUNT(*) FROM properties WHERE status = 'Pending' AND is_deleted = false"
    );
    const pendingProperties = parseInt(pendingPropertiesRes.rows[0].count, 10);

    res.json({
      success: true,
      data: {
        totalBrokers,
        activeProPlans,
        monthlyRevenue,
        pendingProperties
      }
    });
  } catch (err) {
    next(err);
  }
};

// 2. Get Broker List with optional search
export const getBrokers = async (req, res, next) => {
  const { q } = req.query;
  try {
    let sql = `
      SELECT u.id, u.full_name as name, u.phone_number as phone, u.city as location, 
             s.plan_name as plan, u.status, u.created_at as joined
      FROM users u
      LEFT JOIN subscriptions s ON s.broker_id = u.id
      WHERE u.role = 'broker'
    `;
    const params = [];

    if (q) {
      sql += ` AND (u.full_name ILIKE $1 OR u.city ILIKE $1 OR u.phone_number ILIKE $1)`;
      params.push(`%${q}%`);
    }

    sql += ` ORDER BY u.created_at DESC`;
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

// 3. Block/Unblock Broker
export const updateBrokerStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body; // 'Active' or 'Blocked'

  try {
    if (!status || (status !== 'Active' && status !== 'Blocked')) {
      return res.status(400).json({ success: false, message: "Invalid status. Must be 'Active' or 'Blocked'" });
    }

    const result = await query(
      `UPDATE users SET status = $1 WHERE id = $2 AND role = 'broker' RETURNING id, full_name, status`,
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Broker not found" });
    }

    res.json({
      success: true,
      message: `Broker is now ${status}`,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// 4. Get Transactions History
export const getTransactions = async (req, res, next) => {
  try {
    const sql = `
      SELECT p.id, u.full_name as user, p.plan_purchased as plan, p.amount_inr as amount, 
             p.created_at as date, p.status
      FROM payment_history p
      JOIN users u ON u.id = p.broker_id
      ORDER BY p.created_at DESC
      LIMIT 100
    `;
    const result = await query(sql);
    
    // Map status to uppercase 'Success' / 'Failed' / 'Pending' for UI styling compatibility
    const mappedRows = result.rows.map(row => ({
      ...row,
      status: row.status === 'success' ? 'Success' : (row.status === 'failed' ? 'Failed' : 'Pending')
    }));

    res.json({
      success: true,
      data: mappedRows
    });
  } catch (err) {
    next(err);
  }
};

// 5. Get Pending Properties for Moderation
export const getProperties = async (req, res, next) => {
  try {
    const sql = `
      SELECT p.id, p.title, u.full_name as broker, p.city as location, p.price, 
             p.cover_image_url as image, p.status
      FROM properties p
      JOIN users u ON u.id = p.broker_id
      WHERE p.status = 'Pending' AND p.is_deleted = false
      ORDER BY p.created_at DESC
    `;
    const result = await query(sql);

    // Ensure price has currency symbol formatted if needed, or return as numeric
    const mappedRows = result.rows.map(row => ({
      ...row,
      price: `₹${parseFloat(row.price).toLocaleString('en-IN')}`
    }));

    res.json({
      success: true,
      data: mappedRows
    });
  } catch (err) {
    next(err);
  }
};

// 6. Approve or Reject Property
export const updatePropertyStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body; // 'Available' (Approved) or 'Rejected'

  try {
    if (!status || (status !== 'Available' && status !== 'Rejected')) {
      return res.status(400).json({ success: false, message: "Invalid status. Must be 'Available' or 'Rejected'" });
    }

    const result = await query(
      `UPDATE properties SET status = $1, updated_at = NOW() WHERE id = $2 AND is_deleted = false RETURNING id, title, status`,
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    res.json({
      success: true,
      message: `Property is now ${status === 'Available' ? 'Approved' : 'Rejected'}`,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};
