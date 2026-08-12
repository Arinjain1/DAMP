import { query } from '../config/db.js';

// 1. Get Dashboard Stats
export const getStats = async (req, res, next) => {
  const { city } = req.query; // Optional city filter
  try {
    let usersFilter = "WHERE role = 'broker'";
    let propsFilter = "WHERE status = 'Pending' AND is_deleted = false";
    let subsJoinFilter = "JOIN users u ON s.broker_id = u.id WHERE s.plan_name != 'trial' AND s.status = 'active' AND s.valid_until > NOW()";
    let paymentsJoinFilter = "JOIN users u ON p.broker_id = u.id WHERE p.status = 'success' AND p.created_at >= DATE_TRUNC('month', CURRENT_DATE)";
    let failedSubsJoinFilter = "JOIN users u ON s.broker_id = u.id WHERE s.status IN ('grace', 'expired')";
    let disputesJoinFilter = "JOIN users u ON c.sender_id = u.id WHERE c.status = 'disputed'";
    
    let chartActiveFilter = "WHERE role = 'broker' AND created_at <= months.month + INTERVAL '1 month'";
    let chartPaidFilter = "JOIN users u ON s.broker_id = u.id WHERE s.plan_name != 'trial' AND s.status = 'active' AND s.created_at <= months.month + INTERVAL '1 month'";
    
    let recentUsersFilter = "WHERE role = 'broker'";
    let recentPaymentsFilter = "JOIN users u ON p.broker_id = u.id WHERE p.status = 'success'";
    let recentPropertiesFilter = "JOIN users u ON p.broker_id = u.id";

    const params = [];
    if (city) {
      params.push(city);
      usersFilter += " AND city = $1";
      propsFilter += " AND city = $1";
      subsJoinFilter += " AND u.city = $1";
      paymentsJoinFilter += " AND u.city = $1";
      failedSubsJoinFilter += " AND u.city = $1";
      disputesJoinFilter += " AND u.city = $1";
      
      chartActiveFilter += " AND city = $1";
      chartPaidFilter += " AND u.city = $1";
      
      recentUsersFilter += " AND city = $1";
      recentPaymentsFilter += " AND u.city = $1";
      recentPropertiesFilter += " AND p.city = $1";
    }

    const [
      brokersCountRes,
      activeBrokersRes,
      activeProPlansRes,
      monthlyRevRes,
      pendingPropertiesRes,
      failedRenewalsRes,
      openDisputesRes,
      chartRes,
      recentUsers,
      recentPayments,
      recentProperties,
      citiesRes
    ] = await Promise.all([
      // 1. Total Brokers count
      query(`SELECT COUNT(*) FROM users ${usersFilter}`, params),
      // 2. Active Brokers count (Active 30D)
      query(`SELECT COUNT(*) FROM users ${usersFilter} AND status = 'Active'`, params),
      // 3. Active Pro Plans count
      query(`SELECT COUNT(*) FROM subscriptions s ${subsJoinFilter}`, params),
      // 4. Monthly Revenue
      query(`
        SELECT SUM(p.amount_inr) as total_rev 
        FROM payment_history p 
        ${paymentsJoinFilter}
      `, params),
      // 5. Pending Properties
      query(`SELECT COUNT(*) FROM properties ${propsFilter}`, params),
      // 6. Failed Renewals
      query(`SELECT COUNT(*) FROM subscriptions s ${failedSubsJoinFilter}`, params),
      // 7. Open Disputes
      query(`SELECT COUNT(*) FROM collaborations c ${disputesJoinFilter}`, params),
      // 8. Trend Chart (last 6 months cumulative counts)
      query(`
        WITH months AS (
          SELECT GENERATE_SERIES(DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months', DATE_TRUNC('month', CURRENT_DATE), '1 month'::interval) as month
        )
        SELECT 
          TO_CHAR(months.month, 'Mon') as name,
          (SELECT COUNT(*) FROM users ${chartActiveFilter}) as active,
          (SELECT COUNT(*) FROM subscriptions s ${chartPaidFilter}) as paid
        FROM months
        ORDER BY months.month ASC
      `, params),
      // 9. Live Feed items
      query(`SELECT full_name, created_at FROM users ${recentUsersFilter} ORDER BY created_at DESC LIMIT 5`, params),
      query(`
        SELECT u.full_name, p.plan_purchased, p.created_at 
        FROM payment_history p 
        ${recentPaymentsFilter} 
        ORDER BY p.created_at DESC 
        LIMIT 5
      `, params),
      query(`
        SELECT p.title, u.full_name as broker, p.created_at 
        FROM properties p 
        ${recentPropertiesFilter} 
        ORDER BY p.created_at DESC 
        LIMIT 5
      `, params),
      // 10. Distinct cities list (always un-filtered so we populate the dropdown options!)
      query("SELECT DISTINCT city FROM users WHERE role = 'broker' AND city IS NOT NULL AND city != '' ORDER BY city ASC")
    ]);

    const totalBrokers = parseInt(brokersCountRes.rows[0].count, 10);
    const activeBrokers = parseInt(activeBrokersRes.rows[0].count, 10);
    const activeProPlans = parseInt(activeProPlansRes.rows[0].count, 10);
    const monthlyRevenue = parseFloat(monthlyRevRes.rows[0].total_rev || 0);
    const pendingProperties = parseInt(pendingPropertiesRes.rows[0].count, 10);
    const failedRenewals = parseInt(failedRenewalsRes.rows[0].count, 10);
    const openDisputes = parseInt(openDisputesRes.rows[0].count, 10);
    const cities = citiesRes.rows.map(r => r.city);

    // Format trend chart
    const chartData = chartRes.rows.map(row => ({
      name: row.name,
      active: parseInt(row.active, 10),
      paid: parseInt(row.paid, 10)
    }));

    // Format live feed events
    const events = [];
    recentUsers.rows.forEach(row => {
      events.push({
        time: row.created_at,
        event: `${row.full_name} registered as a broker`
      });
    });
    recentPayments.rows.forEach(row => {
      events.push({
        time: row.created_at,
        event: `${row.full_name} purchased ${row.plan_purchased || 'Pro Plan'}`
      });
    });
    recentProperties.rows.forEach(row => {
      events.push({
        time: row.created_at,
        event: `New listing: "${row.title}" by ${row.broker}`
      });
    });

    events.sort((a, b) => new Date(b.time) - new Date(a.time));
    const liveFeed = events.slice(0, 4).map(ev => {
      const diffMs = new Date() - new Date(ev.time);
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      
      let timeStr = 'Just now';
      if (diffMins > 0 && diffMins < 60) {
        timeStr = `${diffMins}m ago`;
      } else if (diffHours > 0 && diffHours < 24) {
        timeStr = `${diffHours}h ago`;
      } else if (diffHours >= 24) {
        timeStr = `${Math.floor(diffHours / 24)}d ago`;
      }

      return {
        time: timeStr,
        event: ev.event
      };
    });

    res.json({
      success: true,
      data: {
        totalBrokers,
        activeBrokers,
        activeProPlans,
        monthlyRevenue,
        pendingProperties,
        failedRenewals,
        openDisputes,
        securityAlerts: 3,
        cities,
        chartData,
        liveFeed
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
             s.plan_name as plan, u.status, u.created_at as joined,
             s.created_at as plan_start, s.valid_until as plan_end,
             (SELECT COUNT(*) FROM properties WHERE broker_id = u.id AND is_deleted = false) as props,
             (SELECT COUNT(*) FROM contacts WHERE broker_id = u.id AND is_deleted = false) as clients
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
    const [
      transactionsRes,
      paidUsersRes,
      mrrRes,
      failedRenewalsRes
    ] = await Promise.all([
      query(`
        SELECT p.id, u.full_name as user, p.plan_purchased as plan, p.amount_inr as amount, 
               p.created_at as date, p.status
        FROM payment_history p
        JOIN users u ON u.id = p.broker_id
        ORDER BY p.created_at DESC
        LIMIT 100
      `),
      query("SELECT COUNT(*) FROM subscriptions WHERE plan_name != 'trial' AND status = 'active' AND valid_until > NOW()"),
      query("SELECT SUM(amount_inr) as total_rev FROM payment_history WHERE status = 'success' AND created_at >= DATE_TRUNC('month', CURRENT_DATE)"),
      query("SELECT COUNT(*) FROM subscriptions WHERE status IN ('grace', 'expired')")
    ]);
    
    // Map status to uppercase 'Success' / 'Failed' / 'Pending' for UI styling compatibility
    const transactions = transactionsRes.rows.map(row => ({
      ...row,
      status: row.status === 'success' ? 'Success' : (row.status === 'failed' ? 'Failed' : 'Pending')
    }));

    const totalPaidUsers = parseInt(paidUsersRes.rows[0].count, 10);
    const mrr = parseFloat(mrrRes.rows[0].total_rev || 0);
    const failedRenewals = parseInt(failedRenewalsRes.rows[0].count, 10);

    res.json({
      success: true,
      data: {
        transactions,
        stats: {
          totalPaidUsers,
          mrr,
          failedRenewals
        }
      }
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

// 7. Get Broker Recent Activities
export const getBrokerActivity = async (req, res, next) => {
  const { id } = req.params;
  try {
    const [
      propertiesRes,
      contactsRes,
      paymentsRes,
      userRes
    ] = await Promise.all([
      query("SELECT title, created_at FROM properties WHERE broker_id = $1 AND is_deleted = false ORDER BY created_at DESC LIMIT 5", [id]),
      query("SELECT name, created_at FROM contacts WHERE broker_id = $1 AND is_deleted = false ORDER BY created_at DESC LIMIT 5", [id]),
      query("SELECT plan_purchased, created_at FROM payment_history WHERE broker_id = $1 AND status = 'success' ORDER BY created_at DESC LIMIT 5", [id]),
      query("SELECT created_at FROM users WHERE id = $1", [id])
    ]);

    const activities = [];

    // Add registration
    if (userRes.rows.length > 0) {
      activities.push({
        time: userRes.rows[0].created_at,
        action: "Registered on Brokmate platform",
        type: "system"
      });
    }

    // Add properties
    propertiesRes.rows.forEach(p => {
      activities.push({
        time: p.created_at,
        action: `Listed property "${p.title}"`,
        type: "property"
      });
    });

    // Add contacts
    contactsRes.rows.forEach(c => {
      activities.push({
        time: c.created_at,
        action: `Added new client "${c.name}"`,
        type: "client"
      });
    });

    // Add payments
    paymentsRes.rows.forEach(p => {
      activities.push({
        time: p.created_at,
        action: `Purchased subscription plan "${p.plan_purchased || 'Pro Plan'}"`,
        type: "payment"
      });
    });

    // Sort by time descending
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Format relative time strings
    const formattedActivities = activities.map(act => {
      const diffMs = new Date() - new Date(act.time);
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      
      let timeStr = 'Just now';
      if (diffMins > 0 && diffMins < 60) {
        timeStr = `${diffMins}m ago`;
      } else if (diffHours > 0 && diffHours < 24) {
        timeStr = `${diffHours}h ago`;
      } else if (diffHours >= 24) {
        timeStr = `${Math.floor(diffHours / 24)}d ago`;
      }

      return {
        time: timeStr,
        action: act.action
      };
    });

    res.json({
      success: true,
      data: formattedActivities.slice(0, 8)
    });
  } catch (err) {
    next(err);
  }
};

// 8. Get Platform Analytics Stats
export const getAnalytics = async (req, res, next) => {
  try {
    const [
      totalRes,
      activeRes,
      paidRes,
      newRes,
      citiesRes
    ] = await Promise.all([
      query("SELECT COUNT(*) FROM users WHERE role = 'broker'"),
      query("SELECT COUNT(*) FROM users WHERE role = 'broker' AND status = 'Active'"),
      query("SELECT COUNT(*) FROM subscriptions s JOIN users u ON s.broker_id = u.id WHERE s.plan_name != 'trial' AND s.status = 'active' AND s.valid_until > NOW()"),
      query("SELECT COUNT(*) FROM users WHERE role = 'broker' AND created_at >= NOW() - INTERVAL '30 days'"),
      query(`
        SELECT city, COUNT(*) as count 
        FROM users 
        WHERE role = 'broker' AND city IS NOT NULL AND city != '' 
        GROUP BY city 
        ORDER BY count DESC 
        LIMIT 4
      `)
    ]);

    const totalBrokers = parseInt(totalRes.rows[0].count, 10);
    const activeBrokers = parseInt(activeRes.rows[0].count, 10);
    const paidBrokers = parseInt(paidRes.rows[0].count, 10);
    const newBrokers = parseInt(newRes.rows[0].count, 10);

    // Calculate rates
    const activationRate = totalBrokers > 0 ? parseFloat(((activeBrokers / totalBrokers) * 100).toFixed(1)) : 0;
    const paidConversionRate = totalBrokers > 0 ? parseFloat(((paidBrokers / totalBrokers) * 100).toFixed(1)) : 0;

    // City distribution format
    const colors = ['#7c6ce0', '#BFB7FD', '#a59cee', '#e0dbff'];
    const rawCities = citiesRes.rows;
    const cityTotal = rawCities.reduce((acc, row) => acc + parseInt(row.count, 10), 0);
    
    const cityDistribution = rawCities.map((row, idx) => ({
      name: row.city,
      value: cityTotal > 0 ? Math.round((parseInt(row.count, 10) / cityTotal) * 100) : 0,
      color: colors[idx % colors.length]
    }));

    res.json({
      success: true,
      data: {
        totalBrokers,
        activeBrokers,
        paidBrokers,
        newBrokers,
        activationRate,
        paidConversionRate,
        cityDistribution
      }
    });
  } catch (err) {
    next(err);
  }
};

// 9. Get Platform Audit & Security Logs
export const getAuditLogs = async (req, res, next) => {
  try {
    const [
      brokersRes,
      propertiesRes,
      contactsRes,
      paymentsRes
    ] = await Promise.all([
      query("SELECT id, full_name, created_at, status FROM users WHERE role = 'broker' ORDER BY created_at DESC LIMIT 50"),
      query("SELECT p.id, p.title, u.full_name as broker, p.created_at FROM properties p JOIN users u ON p.broker_id = u.id WHERE p.is_deleted = false ORDER BY p.created_at DESC LIMIT 50"),
      query("SELECT c.id, c.name, u.full_name as broker, c.created_at FROM contacts c JOIN users u ON c.broker_id = u.id WHERE c.is_deleted = false ORDER BY c.created_at DESC LIMIT 50"),
      query("SELECT p.id, p.plan_purchased, u.full_name as broker, p.created_at, p.status FROM payment_history p JOIN users u ON p.broker_id = u.id ORDER BY p.created_at DESC LIMIT 50")
    ]);

    const logs = [];

    // 1. Broker registrations
    brokersRes.rows.forEach(b => {
      logs.push({
        id: `AUD-${b.id.substring(0, 4).toUpperCase()}`,
        action: 'Register Account',
        actor: b.full_name,
        object: 'Broker Profile',
        result: 'Success',
        time: b.created_at
      });

      if (b.status === 'Blocked') {
        logs.push({
          id: `AUD-BLK-${b.id.substring(0, 4).toUpperCase()}`,
          action: 'Block Account',
          actor: 'Super Admin',
          object: b.full_name,
          result: 'Enforced',
          time: new Date()
        });
      }
    });

    // 2. Property additions
    propertiesRes.rows.forEach(p => {
      logs.push({
        id: `AUD-${p.id.substring(0, 4).toUpperCase()}`,
        action: 'Add Property',
        actor: p.broker,
        object: p.title,
        result: 'Success',
        time: p.created_at
      });
    });

    // 3. Client registrations
    contactsRes.rows.forEach(c => {
      logs.push({
        id: `AUD-${c.id.substring(0, 4).toUpperCase()}`,
        action: 'Add Client',
        actor: c.broker,
        object: c.name,
        result: 'Success',
        time: c.created_at
      });
    });

    // 4. Payment events
    paymentsRes.rows.forEach(p => {
      logs.push({
        id: `AUD-${p.id.substring(0, 4).toUpperCase()}`,
        action: 'Subscription Payment',
        actor: p.broker,
        object: p.plan_purchased || 'Pro Plan',
        result: p.status === 'success' ? 'Success' : 'Failed',
        time: p.created_at
      });
    });

    // Sort all logs by time descending
    logs.sort((a, b) => new Date(b.time) - new Date(a.time));

    // Format relative time strings
    const formattedLogs = logs.map(log => {
      const diffMs = new Date() - new Date(log.time);
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      
      let timeStr = 'Just now';
      if (diffMins > 0 && diffMins < 60) {
        timeStr = `${diffMins}m ago`;
      } else if (diffHours > 0 && diffHours < 24) {
        timeStr = `${diffHours}h ago`;
      } else if (diffHours >= 24) {
        timeStr = `${Math.floor(diffHours / 24)}d ago`;
      }

      return {
        id: log.id,
        action: log.action,
        actor: log.actor,
        object: log.object,
        result: log.result,
        time: timeStr
      };
    });

    res.json({
      success: true,
      data: formattedLogs.slice(0, 50)
    });
  } catch (err) {
    next(err);
  }
};

// 10. Refund Payment Transaction
export const refundTransaction = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await query(
      "UPDATE payment_history SET status = 'failed' WHERE id = $1 RETURNING id, status",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.json({
      success: true,
      message: "Transaction successfully refunded",
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};
