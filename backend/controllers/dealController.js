import { query } from '../config/db.js';

// Helper: Mask phone numbers for collaborators
const maskPhone = (phone) => {
  if (!phone || phone.length < 6) return "XXXXXX";
  return phone.slice(0, 4) + "XXXXXX" + phone.slice(-2);
};

// 1. Get Deals List (Shared Visibility)
export const getDeals = async (req, res, next) => {
  const brokerId = req.user.id;
  const { status, type } = req.query;
  try {
    let sql = `
      SELECT 
        d.id, d.status, d.final_price, d.created_at, d.updated_at,
        d.client_id, d.property_id, d.broker_id as deal_owner_id,
        p.title as property_title, p.address as property_address, p.city, p.cover_image_url,
        c.name as client_name, c.phone as client_phone,
        CASE WHEN d.broker_id = $1 THEN true ELSE false END as is_my_deal
      FROM deals d
      JOIN properties p ON d.property_id = p.id
      JOIN contacts c ON d.client_id = c.id
      WHERE d.is_deleted = false AND c.is_deleted = false
      AND (
        d.broker_id = $1 
        OR d.property_id IN (
          SELECT DISTINCT UNNEST(shared_properties) 
          FROM collaborations 
          WHERE (sender_id = $1 OR receiver_id = $1) AND status = 'accepted'
        )
      )
    `;

    const params = [brokerId];
    if (type === 'mine') sql += ` AND d.broker_id = $1`;
    else if (type === 'network') sql += ` AND d.broker_id != $1`;

    if (status && status !== 'All') {
      const statusMap = { 'New': "'Interested'", 'Contacted': "('Contacted', 'Meeting')", 'Site Visit': "'Site Visit'", 'Negotiation': "'Negotiation'", 'Closed': "('Token', 'Closed')" };
      sql += ` AND d.status ${statusMap[status] || "= '" + status + "'"}`;
    }

    sql += ` ORDER BY d.updated_at DESC`;
    const result = await query(sql, params);

    const finalData = result.rows.map(deal => {
      if (!deal.is_my_deal) {
        deal.client_phone = maskPhone(deal.client_phone);
        deal.client_name = `${deal.client_name} (Partner Lead)`;
      }
      return deal;
    });

    res.json({ success: true, count: result.rowCount, data: finalData });
  } catch (err) { next(err); }
};

// 2. Create Deal (Owner Only)
export const createDeal = async (req, res, next) => {
  const brokerId = req.user.id;
  const { client_id, property_id } = req.body;
  try {
    const result = await query(
      `INSERT INTO deals (broker_id, client_id, property_id, status) VALUES ($1, $2, $3, 'Interested') RETURNING *`,
      [brokerId, client_id, property_id]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

// 3. Update Deal Stage (Owner Only)
export const updateDealStage = async (req, res, next) => {
  const brokerId = req.user.id;
  const dealId = req.params.id;
  const { outcome } = req.body;
  try {
    const statusMap = { 'interested': 'Interested', 'site_visit': 'Site Visit', 'negotiation': 'Negotiation', 'token': 'Token', 'lost': 'Lost' };
    const result = await query(
      `UPDATE deals SET status = $1, updated_at = NOW() WHERE id = $2 AND broker_id = $3 AND is_deleted = false RETURNING *`,
      [statusMap[outcome], dealId, brokerId]
    );
    if (result.rowCount === 0) return res.status(403).json({ message: "Unauthorized" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

// 4. Get Negotiation (Viewable by Collaborators)
export const getNegotiation = async (req, res, next) => {
  const brokerId = req.user.id;
  const dealId = req.params.dealId;
  try {
    const result = await query(
      `SELECT id, expected_price, customer_offer, owner_counter_offer, final_price, status, broker_id
       FROM deals WHERE id = $1 AND is_deleted = false
       AND (broker_id = $2 OR property_id IN (SELECT DISTINCT UNNEST(shared_properties) FROM collaborations WHERE (sender_id = $2 OR receiver_id = $2) AND status = 'accepted'))`,
      [dealId, brokerId]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Deal not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

// 5. Update Negotiation (Owner Only)
export const updateNegotiation = async (req, res, next) => {
  const brokerId = req.user.id;
  const dealId = req.params.dealId;
  const { expected_price, customer_offer, owner_counter_offer, final_price, complete } = req.body;

  try {
    // Check current deal status to preserve Token status if already set
    const currentDeal = await query(`SELECT status FROM deals WHERE id = $1`, [dealId]);
    const currentStatus = currentDeal.rows[0]?.status;

    // If complete flag is true, set status to 'Token', otherwise preserve or set to 'Negotiation'
    let newStatus;
    if (complete) {
      newStatus = 'Token';
    } else {
      newStatus = (currentStatus === 'Token' || currentStatus === 'Completed') ? currentStatus : 'Negotiation';
    }

    const result = await query(
      `UPDATE deals 
       SET expected_price = $1, customer_offer = $2, owner_counter_offer = $3, final_price = $4, status = $5
       WHERE id = $6 AND broker_id = $7 AND is_deleted = false 
       RETURNING *`,
      [expected_price, customer_offer, owner_counter_offer, final_price, newStatus, dealId, brokerId]
    );
    if (result.rowCount === 0) return res.status(403).json({ message: "Unauthorized" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

// 6. Add Transaction (Owner Only)
export const addTransaction = async (req, res, next) => {
  const brokerId = req.user.id;
  const dealId = req.params.dealId;
  const { transaction_type, amount, payment_mode, transaction_ref, status, due_date, remark } = req.body;
  try {
    const dealCheck = await query(`SELECT id FROM deals WHERE id = $1 AND broker_id = $2 AND is_deleted = false`, [dealId, brokerId]);
    if (dealCheck.rowCount === 0) return res.status(403).json({ message: "Unauthorized" });

    const result = await query(
      `INSERT INTO deal_transactions (deal_id, transaction_type, amount, payment_mode, transaction_ref, status, due_date, remark) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [dealId, transaction_type, amount, payment_mode, transaction_ref, status, due_date, remark]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

// 7. Complete Transaction (Owner Only)
export const completeTransaction = async (req, res, next) => {
  const brokerId = req.user.id;
  const transactionId = req.params.transactionId;
  const { transaction_ref } = req.body;
  try {
    const result = await query(
      `UPDATE deal_transactions dt
       SET status = 'Completed', completed_on = NOW(), transaction_ref = COALESCE($1, transaction_ref)
       FROM deals d
       WHERE dt.id = $2 AND dt.deal_id = d.id AND d.broker_id = $3
       RETURNING dt.*`,
      [transaction_ref, transactionId, brokerId]
    );

    if (result.rowCount === 0) return res.status(403).json({ message: "Unauthorized or not found" });

    // If it was a Token, update the main Deal status
    if (result.rows[0].transaction_type === 'Token') {
      await query(`UPDATE deals SET token_amount = $1, status = 'Token' WHERE id = $2`, [result.rows[0].amount, result.rows[0].deal_id]);
    }

    res.json({ success: true, message: "Transaction completed", data: result.rows[0] });
  } catch (err) { next(err); }
};

// 8. Cancel Transaction (Owner Only)
export const cancelTransaction = async (req, res, next) => {
  const brokerId = req.user.id;
  const transactionId = req.params.transactionId;
  try {
    const result = await query(
      `UPDATE deal_transactions dt
       SET status = 'Cancelled'
       FROM deals d
       WHERE dt.id = $1 AND dt.deal_id = d.id AND d.broker_id = $2
       RETURNING dt.*`,
      [transactionId, brokerId]
    );
    if (result.rowCount === 0) return res.status(403).json({ message: "Unauthorized or not found" });
    res.json({ success: true, message: "Transaction cancelled" });
  } catch (err) { next(err); }
};

// 9. Get Deal History (Shared Visibility)
export const getDealHistory = async (req, res, next) => {
  const brokerId = req.user.id;
  const dealId = req.params.dealId;
  try {
    const dealRes = await query(
      `SELECT id FROM deals WHERE id = $1 AND is_deleted = false
       AND (broker_id = $2 OR property_id IN (SELECT DISTINCT UNNEST(shared_properties) FROM collaborations WHERE (sender_id = $2 OR receiver_id = $2) AND status = 'accepted'))`,
      [dealId, brokerId]
    );
    if (dealRes.rowCount === 0) return res.status(404).json({ message: "History not found" });

    const history = await query(`SELECT * FROM deal_transactions WHERE deal_id = $1 ORDER BY created_at ASC`, [dealId]);
    res.json({ success: true, data: history.rows });
  } catch (err) { next(err); }
};

// 10. Delete Deal (Owner Only)
export const deleteDeal = async (req, res, next) => {
  const brokerId = req.user.id;
  const dealId = req.params.id;
  try {
    const result = await query(`UPDATE deals SET is_deleted = true WHERE id = $1 AND broker_id = $2 RETURNING id`, [dealId, brokerId]);
    if (result.rowCount === 0) return res.status(403).json({ message: "Unauthorized" });
    res.json({ success: true, message: "Deal deleted" });
  } catch (err) { next(err); }
};