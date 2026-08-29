import { query } from '../config/db.js';

export const getDashboardOverview = async (req, res, next) => {
  const brokerId = req.user.id; 

  try {
    const [
      visitorCount, 
      saleCount, 
      pendingCount, 
      rejectedCount, 
      activeDealsList, 
      todayTasksData,
      networkCount // RESTORED: The network count variable
    ] = await Promise.all([
      query('SELECT COUNT(*) FROM contacts WHERE broker_id = $1 AND is_deleted = false', [brokerId]),
      query("SELECT COUNT(*) FROM deals d WHERE (d.broker_id = $1 OR EXISTS (SELECT 1 FROM collab_rooms cr WHERE cr.client_id = d.client_id AND cr.property_id = d.property_id AND (cr.broker_1_id = $1 OR cr.broker_2_id = $1))) AND d.status IN ('Closed', 'Completed') AND d.is_deleted = false", [brokerId]),
      query("SELECT COUNT(*) FROM deals d WHERE (d.broker_id = $1 OR EXISTS (SELECT 1 FROM collab_rooms cr WHERE cr.client_id = d.client_id AND cr.property_id = d.property_id AND (cr.broker_1_id = $1 OR cr.broker_2_id = $1) AND cr.is_active = true)) AND NOT (d.status IN ('Closed', 'Completed') AND d.updated_at < NOW() - INTERVAL '7 days') AND d.status != 'Lost' AND d.is_deleted = false", [brokerId]),
      query("SELECT COUNT(*) FROM deals d WHERE (d.broker_id = $1 OR EXISTS (SELECT 1 FROM collab_rooms cr WHERE cr.client_id = d.client_id AND cr.property_id = d.property_id AND (cr.broker_1_id = $1 OR cr.broker_2_id = $1) AND cr.is_active = true)) AND d.status = 'Lost' AND d.is_deleted = false", [brokerId]),
      query(
        `SELECT d.id, d.status, d.final_price, d.client_id, d.property_id,
                p.title as property_title, p.cover_image_url, p.price as listing_price,
                c.name as client_name
         FROM deals d
         JOIN properties p ON d.property_id = p.id
         JOIN contacts c ON d.client_id = c.id
         WHERE d.broker_id = $1 
         AND NOT EXISTS (
           SELECT 1 FROM collab_rooms cr 
           WHERE cr.client_id = d.client_id AND cr.property_id = d.property_id 
             AND cr.is_active = true
         )
         AND NOT (d.status IN ('Closed', 'Completed') AND d.updated_at < NOW() - INTERVAL '7 days')
         AND d.status != 'Lost'
         AND d.is_deleted = false 
         AND p.is_deleted = false 
         AND c.is_deleted = false
         ORDER BY d.updated_at DESC
         LIMIT 5`, 
        [brokerId]
      ),
      query(
        `SELECT t.id, t.title, t.due_date, t.status, c.name as client_name 
         FROM tasks t
         LEFT JOIN contacts c ON t.client_id = c.id
         WHERE t.broker_id = $1 
         AND t.status = 'pending'
         AND t.due_date::date = CURRENT_DATE 
         AND t.is_deleted = false
         AND (c.id IS NULL OR c.is_deleted = false) 
         ORDER BY t.due_date ASC`,
        [brokerId]
      ),
      // RESTORED: The actual database query to count connections
      query(`SELECT COUNT(*) FROM collaborations WHERE (sender_id = $1 OR receiver_id = $1) AND status = 'accepted'`, [brokerId])
    ]);
    
    res.json({
      success: true,
      data: {
        stats: {
          total_visitor: parseInt(visitorCount.rows[0].count),
          total_sale: parseInt(saleCount.rows[0].count),
          pending: parseInt(pendingCount.rows[0].count),
          rejected: parseInt(rejectedCount.rows[0].count),
          network_count: parseInt(networkCount.rows[0].count) // RESTORED: Sending it to the frontend
        },
        active_deals: activeDealsList.rows, 
        todays_focus: todayTasksData.rows   
      }
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    next(err);
  }
};