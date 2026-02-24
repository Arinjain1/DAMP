import { query } from '../config/db.js';

export const updateNegotiation = async (req, res, next) => {
  const dealId = req.params.dealId;
  const { expected_price, customer_offer, owner_counter_offer, final_price } = req.body;
  try {
    const result = await query(
      `UPDATE deals 
       SET expected_price = $1, customer_offer = $2, owner_counter_offer = $3, final_price = $4, status = 'Negotiation'
       WHERE id = $5 RETURNING *`,
      [expected_price, customer_offer, owner_counter_offer, final_price, dealId]
    );
    res.json({ success: true, message: "Negotiation saved!", data: result.rows[0] });
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