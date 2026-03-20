import { query } from '../config/db.js';

export const getTasks = async (req, res, next) => {
  const brokerId = req.user.id;
  const { status = 'pending', date, task_type } = req.query; 
  try {
    // GET FIX: Filter out deleted tasks, and hide tasks if the attached client/property is deleted
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
        WHERE svi.site_visit_id = sv.id AND prop.is_deleted = false) as site_visit_properties
      FROM tasks t
      LEFT JOIN contacts c ON t.client_id = c.id
      LEFT JOIN properties p ON t.property_id = p.id 
      LEFT JOIN site_visits sv ON t.site_visit_id = sv.id
      WHERE t.broker_id = $1 
      AND t.is_deleted = false
      AND (c.id IS NULL OR c.is_deleted = false)
      AND (p.id IS NULL OR p.is_deleted = false)
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
    client_id, property_id, task_type, schedule_date, schedule_time, notes 
  } = req.body;
  
  try {
    if (!client_id || !task_type || !schedule_date || !schedule_time) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields." });
    }
    
    const finalDueDate = `${schedule_date} ${schedule_time}`;
    let title = `${task_type}`;
    
    const clientCheck = await query(`SELECT name FROM contacts WHERE id = $1 AND is_deleted = false`, [client_id]);
    if (clientCheck.rows.length > 0) {
      title = `${task_type} with ${clientCheck.rows[0].name}`;
    }
    
    const result = await query(
      `INSERT INTO tasks (
         broker_id, client_id, property_id, title, description, task_type, due_date, status
       ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending') 
       RETURNING *`,
      [
        brokerId, client_id, property_id || null, title, notes || '', task_type, finalDueDate
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
       WHERE id = $1 AND broker_id = $2 AND is_deleted = false
       RETURNING *`,
      [taskId, brokerId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Task not found or deleted" });
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

export const updateTask = async (req, res, next) => {
  const brokerId = req.user.id;
  const taskId = req.params.id;
  const { client_id, property_id, task_type, schedule_date, schedule_time, notes, title } = req.body;  
  try {
    const updates = [];
    const params = [];
    let paramIndex = 1;  
    if (schedule_date && schedule_time) {
      const finalDueDate = `${schedule_date} ${schedule_time}`;
      updates.push(`due_date = $${paramIndex}`);
      params.push(finalDueDate);
      paramIndex++;
    }
    if (task_type) {
      updates.push(`task_type = $${paramIndex}`);
      params.push(task_type);
      paramIndex++;
    }
    if (client_id !== undefined) {
      updates.push(`client_id = $${paramIndex}`);
      params.push(client_id);
      paramIndex++;
    }
    if (property_id !== undefined) {
      updates.push(`property_id = $${paramIndex}`);
      params.push(property_id || null);
      paramIndex++;
    }
    if (notes !== undefined) {
      updates.push(`description = $${paramIndex}`);
      params.push(notes);
      paramIndex++;
    }
    if (title) {
      updates.push(`title = $${paramIndex}`);
      params.push(title);
      paramIndex++;
    }
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }
    
    updates.push(`updated_at = NOW()`);
    params.push(taskId);
    params.push(brokerId);
    const sql = `
      UPDATE tasks 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex} AND broker_id = $${paramIndex + 1} AND is_deleted = false
      RETURNING *
    `;
    const result = await query(sql, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Task not found or deleted" });
    }
    res.json({
      success: true,
      message: "Task updated successfully!",
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  const brokerId = req.user.id;
  const taskId = req.params.id;
  try {
    const result = await query(
      `UPDATE tasks SET is_deleted = true WHERE id = $1 AND broker_id = $2 RETURNING id`,
      [taskId, brokerId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    next(err);
  }
};