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
      todayTasksData
    ] = await Promise.all([
      query('SELECT COUNT(*) FROM contacts WHERE broker_id = $1', [brokerId]),
      query("SELECT COUNT(*) FROM deals WHERE broker_id = $1 AND status = 'Closed'", [brokerId]),
      query("SELECT COUNT(*) FROM deals WHERE broker_id = $1 AND status NOT IN ('Closed', 'Lost')", [brokerId]),
      query("SELECT COUNT(*) FROM deals WHERE broker_id = $1 AND status = 'Lost'", [brokerId]),
      query(
        `SELECT d.id, d.status, d.final_price, 
                p.title as property_title, p.cover_image_url, p.price as listing_price,
                c.name as client_name
         FROM deals d
         JOIN properties p ON d.property_id = p.id
         JOIN contacts c ON d.client_id = c.id
         WHERE d.broker_id = $1 AND d.status NOT IN ('Closed', 'Lost')
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
         ORDER BY t.due_date ASC`,
        [brokerId]
      )
    ]);
    res.json({
      success: true,
      data: {
        stats: {
          total_visitor: parseInt(visitorCount.rows[0].count),
          total_sale: parseInt(saleCount.rows[0].count),
          pending: parseInt(pendingCount.rows[0].count),
          rejected: parseInt(rejectedCount.rows[0].count)
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