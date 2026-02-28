import Razorpay from 'razorpay';
import crypto from 'crypto';
import { query } from '../config/db.js';

// Initialize Razorpay with your keys (Make sure these are in your backend .env file)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Define your pricing and duration rules
const PLAN_DETAILS = {
  'pro_1m': { price: 99, days: 30 },
  'pro_3m': { price: 297, days: 90 },
  'pro_6m': { price: 594, days: 180 },
};

// ------------------------------------------------------------------
// API 1: Create Order
// ------------------------------------------------------------------
export const createOrder = async (req, res, next) => {
  const { planName } = req.body; 
  const brokerId = req.user.id;

  try {
    const plan = PLAN_DETAILS[planName];
    if (!plan) return res.status(400).json({ success: false, message: "Invalid plan selected" });

    // 1. Create order in Razorpay (Amount must be in paise, so multiply by 100)
    const options = {
      amount: plan.price * 100, 
      currency: "INR",
      receipt: `rcpt_${brokerId}_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);

    // 2. Log this pending attempt in your database
    await query(
      `INSERT INTO payment_history (broker_id, razorpay_order_id, amount_inr, plan_purchased, status) 
       VALUES ($1, $2, $3, $4, 'pending')`,
      [brokerId, order.id, plan.price, planName]
    );

    // 3. Send order details back to React Native
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

// ------------------------------------------------------------------
// API 2: Verify Payment
// ------------------------------------------------------------------
export const verifyPayment = async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planName } = req.body;
  const brokerId = req.user.id;

  try {
    // 1. Verify the cryptographic signature to prevent hacking
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Mark as failed in history if it's a fake request
      await query(`UPDATE payment_history SET status = 'failed' WHERE razorpay_order_id = $1`, [razorpay_order_id]);
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // 2. Payment is legit! Update the payment_history table
    await query(
      `UPDATE payment_history 
       SET razorpay_payment_id = $1, razorpay_signature = $2, status = 'success' 
       WHERE razorpay_order_id = $3`,
      [razorpay_payment_id, razorpay_signature, razorpay_order_id]
    );

    // 3. Unlock the App! Update the subscriptions table
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