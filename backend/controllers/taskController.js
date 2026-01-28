import { query } from '../config/db.js';
export const getTasks = async (req, res, next) => {
  const brokerId = req.user.id;
  const { status = 'pending' } = req.query; 

  try {
    const sql = `
      SELECT 
        t.*, 
        c.name as client_name, c.phone as client_phone,
        p.id as property_id,
        p.title as property_title, 
        p.address as property_address,
        p.price as property_price,
        p.plot_area_sqft as property_size,
        p.cover_image_url as property_image
      FROM tasks t
      LEFT JOIN contacts c ON t.client_id = c.id
      LEFT JOIN deals d ON t.deal_id = d.id
      LEFT JOIN properties p ON d.property_id = p.id
      WHERE t.broker_id = $1 AND t.status = $2
      ORDER BY t.due_date ASC
    `;
    
    const result = await query(sql, [brokerId, status]);

    res.json({
      success: true,
      count: result.rowCount,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  const brokerId = req.user.id;
  const { title, description, due_date, client_id, task_type } = req.body;
  try {
    if (!title || !due_date) {
      return res.status(400).json({ message: "Title and Date are required" });
    }
    const result = await query(
      `INSERT INTO tasks (broker_id, title, description, due_date, client_id, task_type, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') 
       RETURNING *`,
      [brokerId, title, description || '', due_date, client_id || null, task_type || 'Call']
    );
    res.status(201).json({
      success: true,
      message: "Task created successfully!",
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};


export const toggleTaskStatus = async (req, res, next) => {
  const brokerId = req.user.id;
  const taskId = req.params.id;

  try {
    const check = await query('SELECT status FROM tasks WHERE id = $1', [taskId]);
    if (check.rows.length === 0) return res.status(404).json({ message: "Task not found" });
    const currentStatus = check.rows[0].status;
    const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';

    const result = await query(
      `UPDATE tasks SET status = $1, updated_at = NOW() 
       WHERE id = $2 AND broker_id = $3 
       RETURNING *`,
      [newStatus, taskId, brokerId]
    );

    res.json({
      success: true,
      message: newStatus === 'completed' ? "Task marked as Done! ✅" : "Task reopened.",
      data: result.rows[0]
    });

  } catch (err) {
    next(err);
  }
};