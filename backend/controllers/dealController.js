import { query } from '../config/db.js';

export const getNegotiation = async (req, res, next) => {
  const dealId = req.params.dealId;
  try {
    const result = await query(
      `SELECT id, expected_price, customer_offer, owner_counter_offer, final_price, status 
       FROM deals WHERE id = $1`,
      [dealId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Deal not found" });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const updateNegotiation = async (req, res, next) => {
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
       WHERE id = $6 RETURNING *`,
      [expected_price, customer_offer, owner_counter_offer, final_price, newStatus, dealId]
    );
    res.json({ success: true, message: complete ? "Negotiation completed!" : "Negotiation saved!", data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const addTransaction = async (req, res, next) => {
  const dealId = req.params.dealId;
  const { transaction_type, amount, payment_mode, transaction_ref, status, due_date, remark } = req.body;
  try {
    const isCompleted = status === 'Completed';
    const completedOn = isCompleted ? new Date() : null;
    const result = await query(
      `INSERT INTO deal_transactions 
       (deal_id, transaction_type, amount, payment_mode, transaction_ref, status, due_date, completed_on, remark) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [dealId, transaction_type, amount, payment_mode, transaction_ref, status, due_date, completedOn, remark]
    );
    if (transaction_type === 'Token' && isCompleted) {
      await query(`UPDATE deals SET token_amount = $1, status = 'Token' WHERE id = $2`, [amount, dealId]);
    }
    res.status(201).json({ success: true, message: "Transaction added!", data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const completeTransaction = async (req, res, next) => {
  const transactionId = req.params.transactionId;
  const { transaction_ref } = req.body; 
  try {
    const result = await query(
      `UPDATE deal_transactions 
       SET status = 'Completed', completed_on = NOW(), transaction_ref = COALESCE($1, transaction_ref)
       WHERE id = $2 RETURNING *`,
      [transaction_ref, transactionId]
    );
    res.json({ success: true, message: "Transaction marked as complete!", data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const getDealHistory = async (req, res, next) => {
  const dealId = req.params.dealId;
  try {
    const dealRes = await query(`SELECT final_price FROM deals WHERE id = $1`, [dealId]);
    const historyRes = await query(
      `SELECT * FROM deal_transactions WHERE deal_id = $1 ORDER BY created_at ASC`, 
      [dealId]
    );
    res.json({
      success: true,
      data: {
        final_price: dealRes.rows[0]?.final_price || 0,
        transactions: historyRes.rows
      }
    });
  } catch (err) {
    next(err);
  }
};