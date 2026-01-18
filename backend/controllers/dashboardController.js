import { query } from '../config/db.js';
export const getDashboardOverview = async (req, res, next) => {
  const brokerId = req.user.id; 
  try {
    const [propsData, clientsData, tasksData, dealsData, todayTasksData] = await Promise.all([
      query('SELECT COUNT(*) FROM properties WHERE broker_id = $1', [brokerId]),
      query('SELECT COUNT(*) FROM contacts WHERE broker_id = $1', [brokerId]),
      query("SELECT COUNT(*) FROM tasks WHERE broker_id = $1 AND status = 'pending'", [brokerId]),
      query("SELECT COUNT(*) FROM collaborations WHERE broker_id = $1 AND status = 'active'", [brokerId]),
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
          properties: parseInt(propsData.rows[0].count),
          clients: parseInt(clientsData.rows[0].count),
          tasks: parseInt(tasksData.rows[0].count),
          active_deals: parseInt(dealsData.rows[0].count)
        },
        todays_focus: todayTasksData.rows
      }
    });

  } catch (err) {
    next(err);
  }
};