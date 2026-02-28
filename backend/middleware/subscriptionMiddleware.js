import { query } from '../config/db.js';

export const requireActiveSubscription = async (req, res, next) => {
  // We assume your verifyToken middleware runs before this and sets req.user.id
  const brokerId = req.user.id; 

  try {
    const subResult = await query(
      `SELECT plan_name, status, valid_until 
       FROM subscriptions 
       WHERE broker_id = $1`,
      [brokerId]
    );

    const sub = subResult.rows[0];

    // 1. Failsafe: If somehow they don't have a row at all
    if (!sub) {
      return res.status(403).json({ 
        success: false, 
        message: "No subscription record found. Please contact support.",
        code: "SUBSCRIPTION_MISSING" 
      });
    }

    // 2. The Core Check: Has the clock run out?
    if (new Date() > new Date(sub.valid_until)) {
      
      // Auto-clean the database: change status to expired so we don't have to check the date next time
      if (sub.status === 'active') {
        await query(`UPDATE subscriptions SET status = 'expired' WHERE broker_id = $1`, [brokerId]);
      }

      // Send the strict 403 error back to the phone
      return res.status(403).json({ 
        success: false, 
        message: "Your subscription has expired. Please renew to continue using the app.",
        code: "SUBSCRIPTION_EXPIRED" 
      });
    }

    // 3. If we reach here, they are active and their time hasn't run out!
    next(); // Let them through to the actual API controller

  } catch (err) {
    console.error("Subscription Check Error:", err);
    res.status(500).json({ success: false, message: "Internal server error during subscription check" });
  }
};