import { query } from '../config/db.js';

export const addClient = async (req, res, next) => {
  const brokerId = req.user.id;
  const { name, phone, requirement_type, property_category, property_type, configuration, furnishing_status, budget_min, budget_max, preferred_location, notes } = req.body;
  try {
    if (!name || !phone) return res.status(400).json({ success: false, message: "Name and Phone are required" });
    const result = await query(
      `INSERT INTO contacts (
         broker_id, name, phone, requirement_type, property_category, property_type, 
         configuration, furnishing_status, budget_min, budget_max, preferred_location, notes, status
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'New') 
       RETURNING *`,
      [brokerId, name, phone, requirement_type, property_category, property_type, configuration, furnishing_status, budget_min || 0, budget_max || 0, preferred_location || '', notes || '']
    );
    res.status(201).json({ success: true, message: "Client added!", data: result.rows[0] });
  } catch (err) { next(err); }
};

export const getClients = async (req, res, next) => {
  const brokerId = req.user.id;
  const { search } = req.query;
  try {
    let sql = `
      SELECT 
        c.*,
        -- Check for Active Deals (To determine if 'ACTIVE' or 'NEW LEAD' tag shows)
        (SELECT COUNT(*) FROM deals d WHERE d.client_id = c.id AND d.status NOT IN ('Closed', 'Lost')) as active_deal_count,
        -- Fetch the Next Pending Task (To show 'Today 2:30 PM' preview)
        (SELECT row_to_json(t) FROM (
           SELECT title, due_date FROM tasks 
           WHERE client_id = c.id AND status = 'pending' 
           ORDER BY due_date ASC LIMIT 1
         ) t) as next_task
      FROM contacts c 
      WHERE c.broker_id = $1
    `;
    let params = [brokerId];
    if (search) {
      sql += ' AND (c.name ILIKE $2 OR c.phone ILIKE $2)';
      params.push(`%${search}%`);
    }
    sql += ' ORDER BY created_at DESC';
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

export const updateClient = async (req, res, next) => {
  const brokerId = req.user.id;
  const clientId = req.params.id;
  const { 
    name, 
    phone, 
    requirement_type,   
    property_category,  
    property_type,      
    configuration,     
    furnishing_status,  
    budget_min,         
    budget_max,         
    preferred_location, 
    notes               
  } = req.body;

  try {
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: "Name and Phone are required" });
    }

    const result = await query(
      `UPDATE contacts 
       SET name = $1, phone = $2, 
           requirement_type = $3, property_category = $4, property_type = $5, 
           configuration = $6, furnishing_status = $7, 
           budget_min = $8, budget_max = $9, preferred_location = $10, notes = $11
       WHERE id = $12 AND broker_id = $13
       RETURNING *`,
      [
        name, phone, 
        requirement_type, property_category, property_type, 
        configuration, furnishing_status, 
        budget_min || 0, budget_max || 0, preferred_location || '', notes || '',
        clientId, brokerId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    res.json({
      success: true,
      message: "Client updated successfully!",
      data: result.rows[0]
    });

  } catch (err) {
    console.error("Update Client Error:", err);
    next(err);
  }
};

export const getClientDetails = async (req, res, next) => {
  const brokerId = req.user.id;
  const clientId = req.params.id;
  try {
    const clientResult = await query('SELECT * FROM contacts WHERE id = $1 AND broker_id = $2', [clientId, brokerId]);
    if (clientResult.rows.length === 0) return res.status(404).json({ message: "Client not found" });
    const client = clientResult.rows[0];
    const activeDealsResult = await query(
      `SELECT d.id, d.status, p.title, p.address, p.price, p.cover_image_url 
       FROM deals d
       JOIN properties p ON d.property_id = p.id
       WHERE d.client_id = $1 AND d.status NOT IN ('Closed', 'Lost')`,
      [clientId]
    );
    const tasksResult = await query(
      `SELECT * FROM tasks WHERE client_id = $1 ORDER BY due_date ASC`,
      [clientId]
    );
    const matchesResult = await query(
      `SELECT * FROM properties 
       WHERE broker_id = $1 AND status = 'Available'
       AND property_category = $2 
       AND price BETWEEN $3 AND $4
       AND id NOT IN (SELECT property_id FROM deals WHERE client_id = $5)
       LIMIT 5`,
      [brokerId, client.property_category, client.budget_min, client.budget_max, clientId]
    );

    res.json({
      success: true,
      data: {
        profile: client,
        active_deals: activeDealsResult.rows,
        tasks: tasksResult.rows,
        matches: matchesResult.rows 
      }
    });

  } catch (err) {
    next(err);
  }
};

export const updateClientStage = async (req, res, next) => {
  const brokerId = req.user.id;
  const clientId = req.params.id;
  const { status } = req.body; 

  try {
    const result = await query(
      `UPDATE contacts SET status = $1 WHERE id = $2 AND broker_id = $3 RETURNING *`,
      [status, clientId, brokerId]
    );
    res.json({ success: true, message: `Moved to ${status}`, data: result.rows[0] });
  } catch (err) { next(err); }
};
export const toggleTaskStatus = async (req, res, next) => {
  const brokerId = req.user.id;
  const taskId = req.params.taskId;
  
  try {
    await query(
      `UPDATE tasks 
       SET status = CASE WHEN status = 'pending' THEN 'completed' ELSE 'pending' END 
       WHERE id = $1 AND broker_id = $2`,
      [taskId, brokerId]
    );
    res.json({ success: true, message: "Task updated" });
  } catch (err) { next(err); }
};

export const getDeals = async (req, res, next) => {
  const brokerId = req.user.id;
  const { status } = req.query; 
  try {
    let sql = `
      SELECT 
        d.id, d.status, d.final_price, d.created_at, d.updated_at,
        p.title as property_title, p.address as property_address, p.city, p.cover_image_url,
        c.name as client_name, c.phone as client_phone
      FROM deals d
      JOIN properties p ON d.property_id = p.id
      JOIN contacts c ON d.client_id = c.id
      WHERE d.broker_id = $1
    `;
    const params = [brokerId];
    if (status && status !== 'All') {
      if (status === 'New') sql += ` AND d.status = 'Interested'`; 
      else if (status === 'Contacted') sql += ` AND d.status IN ('Contacted', 'Meeting')`;
      else if (status === 'Site Visit') sql += ` AND d.status = 'Site Visit'`;
      else if (status === 'Negotiation') sql += ` AND d.status = 'Negotiation'`;
      else if (status === 'Closed') sql += ` AND d.status IN ('Token', 'Closed')`;
      else { sql += ` AND d.status = $2`; params.push(status); }
    }
    sql += ` ORDER BY d.updated_at DESC`;
    const result = await query(sql, params);
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (err) { next(err); }
};

export const createDeal = async (req, res, next) => {
  const brokerId = req.user.id;
  const { client_id, property_id } = req.body;
  try {
    if (!client_id || !property_id) return res.status(400).json({ success: false, message: "Required fields missing" });
    const existingDeal = await query(`SELECT * FROM deals WHERE client_id = $1 AND property_id = $2`, [client_id, property_id]);
    if (existingDeal.rows.length > 0) return res.status(400).json({ success: false, message: "Deal exists" });
    const result = await query(`INSERT INTO deals (broker_id, client_id, property_id, status) VALUES ($1, $2, $3, 'Interested') RETURNING *`, [brokerId, client_id, property_id]);
    res.status(201).json({ success: true, message: "Deal started!", data: result.rows[0] });
  } catch (err) { next(err); }
};

export const getDealDetails = async (req, res, next) => {
  const brokerId = req.user.id;
  const dealId = req.params.id;
  try {
    const result = await query(
      `SELECT d.id as deal_id, d.status, d.created_at, d.final_price, d.token_amount,
        p.id as property_id, p.title, p.address, p.city, p.price, p.cover_image_url, p.owner_name, p.owner_phone,
        c.id as client_id, c.name as client_name, c.phone as client_phone
       FROM deals d JOIN properties p ON d.property_id = p.id JOIN contacts c ON d.client_id = c.id
       WHERE d.id = $1 AND d.broker_id = $2`, [dealId, brokerId]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Deal not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

export const scheduleDealMeeting = async (req, res, next) => {
  const brokerId = req.user.id;
  const dealId = req.params.id;
  const { meeting_date, notes } = req.body;
  try {
    const dealCheck = await query(`SELECT d.client_id, p.title as property_title, c.name as client_name FROM deals d JOIN properties p ON d.property_id = p.id JOIN contacts c ON d.client_id = c.id WHERE d.id = $1 AND d.broker_id = $2`, [dealId, brokerId]);
    if (dealCheck.rows.length === 0) return res.status(404).json({ message: "Deal not found" });
    const { client_id, property_title, client_name } = dealCheck.rows[0];
    await query(`UPDATE deals SET status = 'Meeting' WHERE id = $1`, [dealId]);
    const taskTitle = `Meeting: ${client_name}`;
    await query(`INSERT INTO tasks (broker_id, title, description, due_date, status, client_id, deal_id) VALUES ($1, $2, $3, $4, 'pending', $5, $6)`, [brokerId, taskTitle, notes || 'Deal Meeting', meeting_date, client_id, dealId]);
    res.json({ success: true, message: "Meeting scheduled!" });
  } catch (err) { next(err); }
};

export const updateDealStage = async (req, res, next) => {
  const brokerId = req.user.id;
  const dealId = req.params.id;
  const { outcome } = req.body;
  try {
    let newStatus;
    if (outcome === 'interested') newStatus = 'Interested';
    else if (outcome === 'site_visit') newStatus = 'Site Visit';
    else if (outcome === 'negotiation') newStatus = 'Negotiation';
    else if (outcome === 'token') newStatus = 'Token';
    else if (outcome === 'not_interested' || outcome === 'lost') newStatus = 'Lost';
    else return res.status(400).json({ message: "Invalid outcome" });
    const result = await query(`UPDATE deals SET status = $1, updated_at = NOW() WHERE id = $2 AND broker_id = $3 RETURNING *`, [newStatus, dealId, brokerId]);
    res.json({ success: true, message: `Deal moved to ${newStatus}`, data: result.rows[0] });
  } catch (err) { next(err); }
};

export const submitTokenPayment = async (req, res, next) => {
  const brokerId = req.user.id;
  const dealId = req.params.id;
  const { final_price, token_amount } = req.body;
  try {
    const propertyIdResult = await query(`SELECT property_id FROM deals WHERE id = $1`, [dealId]);
    if (propertyIdResult.rows.length === 0) return res.status(404).json({ message: "Deal not found" });
    const propertyId = propertyIdResult.rows[0].property_id;
    await query(`UPDATE deals SET final_price = $1, token_amount = $2, status = 'Closed', updated_at = NOW() WHERE id = $3 AND broker_id = $4`, [final_price, token_amount, dealId, brokerId]);
    await query(`UPDATE properties SET status = 'Sold' WHERE id = $1`, [propertyId]);
    const receiptData = await query(`SELECT d.id as deal_id, d.token_amount, d.final_price, d.updated_at, c.name as client_name, p.title as property_title FROM deals d JOIN contacts c ON d.client_id = c.id JOIN properties p ON d.property_id = p.id WHERE d.id = $1`, [dealId]);
    res.json({ success: true, message: "Deal Closed!", data: receiptData.rows[0] });
  } catch (err) { next(err); }
};