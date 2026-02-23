import { query } from '../config/db.js';

export const getTasks = async (req, res, next) => {
  const brokerId = req.user.id;
  const { status = 'pending', date, task_type } = req.query; 
  try {
    let sql = `
      SELECT 
        t.*, 
        c.name as client_name, c.phone as client_phone,
        p.id as property_id,
        p.title as property_title, 
        p.address as property_address,
        p.price as property_price,
        p.cover_image_url as property_image,
        sv.id as site_visit_id,
        sv.scheduled_at as site_visit_scheduled_at,
        (SELECT COUNT(*) FROM site_visit_items WHERE site_visit_id = sv.id) as site_visit_property_count,
        (SELECT json_agg(json_build_object(
          'property_id', svi.property_id,
          'title', prop.title,
          'address', prop.address,
          'location', prop.locality,
          'price', prop.price,
          'cover_image_url', prop.cover_image_url
        ))
        FROM site_visit_items svi
        JOIN properties prop ON svi.property_id = prop.id
        WHERE svi.site_visit_id = sv.id) as site_visit_properties
      FROM tasks t
      LEFT JOIN contacts c ON t.client_id = c.id
      LEFT JOIN properties p ON t.property_id = p.id 
      LEFT JOIN site_visits sv ON t.site_visit_id = sv.id
      WHERE t.broker_id = $1
    `;
    const params = [brokerId];
    let paramIndex = 2;
    if (status && status !== 'All') {
      sql += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (date) {
      sql += ` AND DATE(t.due_date) = $${paramIndex}`;
      params.push(date);
      paramIndex++;
    }
    if (task_type) {
      sql += ` AND t.task_type = $${paramIndex}`;
      params.push(task_type);
      paramIndex++;
    }
    sql += ` ORDER BY t.due_date ASC`;
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

export const createTask = async (req, res, next) => {
  const brokerId = req.user.id;
  const { 
    client_id,      
    property_id,   
    task_type,     
    schedule_date,  
    schedule_time,  
    notes           
  } = req.body;
  try {
    if (!client_id || !task_type || !schedule_date || !schedule_time) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields." });
    }
    const finalDueDate = `${schedule_date} ${schedule_time}`;
    let title = `${task_type}`;
    const clientCheck = await query(`SELECT name FROM contacts WHERE id = $1`, [client_id]);
    if (clientCheck.rows.length > 0) {
      title = `${task_type} with ${clientCheck.rows[0].name}`;
    }
    const result = await query(
      `INSERT INTO tasks (
         broker_id, 
         client_id, 
         property_id, 
         title, 
         description, 
         task_type, 
         due_date, 
         status
       ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending') 
       RETURNING *`,
      [
        brokerId, 
        client_id, 
        property_id || null,
        title, 
        notes || '', 
        task_type, 
        finalDueDate
      ]
    );
    res.status(201).json({
      success: true,
      message: "Task scheduled successfully!",
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
    const result = await query(
      `UPDATE tasks 
       SET status = CASE WHEN status = 'pending' THEN 'completed' ELSE 'pending' END,
           updated_at = NOW() 
       WHERE id = $1 AND broker_id = $2 
       RETURNING *`,
      [taskId, brokerId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }
    const newStatus = result.rows[0].status;
    res.json({
      success: true,
      message: newStatus === 'completed' ? "Task marked as Done! ✅" : "Task reopened.",
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};
