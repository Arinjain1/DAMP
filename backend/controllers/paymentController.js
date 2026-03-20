import Razorpay from 'razorpay';
import crypto from 'crypto';
import { query } from '../config/db.js';
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn("⚠️ Razorpay keys are missing in .env. Payment APIs will fail if called.");
}

const PLAN_DETAILS = {
  'pro_1m': { price: 99, days: 30 },
  'pro_3m': { price: 297, days: 90 },
  'pro_6m': { price: 594, days: 180 },
};
export const createOrder = async (req, res, next) => {
  const { planName } = req.body; 
  const brokerId = req.user.id;
  try {
    if (!razorpay) return res.status(500).json({ success: false, message: "Payment gateway not configured." });
    const plan = PLAN_DETAILS[planName];
    if (!plan) return res.status(400).json({ success: false, message: "Invalid plan selected" });
    const options = {
      amount: plan.price * 100, 
      currency: "INR",
      receipt: `rcpt_${brokerId}_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    await query(
      `INSERT INTO payment_history (broker_id, razorpay_order_id, amount_inr, plan_purchased, status) 
       VALUES ($1, $2, $3, $4, 'pending')`,
      [brokerId, order.id, plan.price, planName]
    );
    res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ success: false, message: "Could not create payment order" });
  }
};

export const verifyPayment = async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planName } = req.body;
  const brokerId = req.user.id;
  try {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await query(
        `UPDATE payment_history SET status = 'failed' WHERE razorpay_order_id = $1 AND broker_id = $2`, 
        [razorpay_order_id, brokerId]
      );
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }
    await query(
      `UPDATE payment_history 
       SET razorpay_payment_id = $1, razorpay_signature = $2, status = 'success' 
       WHERE razorpay_order_id = $3 AND broker_id = $4`,
      [razorpay_payment_id, razorpay_signature, razorpay_order_id, brokerId]
    );
    const daysToAdd = PLAN_DETAILS[planName].days;
    await query(
      `UPDATE subscriptions 
       SET plan_name = $1, 
           status = 'active', 
           valid_until = NOW() + INTERVAL '${daysToAdd} days', 
           updated_at = NOW() 
       WHERE broker_id = $2`,
      [planName, brokerId]
    );
    res.status(200).json({ success: true, message: "Payment successful! App unlocked." });
  } catch (err) {
    console.error("Verify Payment Error:", err);
    res.status(500).json({ success: false, message: "Could not verify payment" });
  }
};