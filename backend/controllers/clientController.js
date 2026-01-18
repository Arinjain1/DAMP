import { query } from '../config/db.js';

export const addClient = async (req, res, next) => {
  const brokerId = req.user.id;
  const { name, phone, budget, preferences, looking_for } = req.body;

  try {
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: "Name and Phone are required" });
    }

    const result = await query(
      `INSERT INTO contacts (broker_id, name, phone, budget, preferences, looking_for, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'New Lead') 
       RETURNING *`,
      [brokerId, name, phone, budget || 0, preferences || '', looking_for || '']
    );

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });

  } catch (err) {
    next(err);
  }
};

export const getClients = async (req, res, next) => {
  const brokerId = req.user.id;
  const { search } = req.query;

  try {
    let sql = 'SELECT * FROM contacts WHERE broker_id = $1';
    let params = [brokerId];

    if (search) {
      sql += ' AND name ILIKE $2';
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


export const getClientDetails = async (req, res, next) => {
  const brokerId = req.user.id;
  const clientId = req.params.id;

  try {
    const clientResult = await query(
      'SELECT * FROM contacts WHERE id = $1 AND broker_id = $2', 
      [clientId, brokerId]
    );

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ message: "Client not found" });
    }
    const client = clientResult.rows[0];

    const activeDealsResult = await query(
      `SELECT d.id, d.status, p.title, p.address, p.price, p.cover_image_url 
       FROM deals d
       JOIN properties p ON d.property_id = p.id
       WHERE d.client_id = $1`,
      [clientId]
    );

    const matchesResult = await query(
      `SELECT * FROM properties 
       WHERE broker_id = $1 
       AND property_type = $2 
       AND price <= $3
       AND id NOT IN (SELECT property_id FROM deals WHERE client_id = $4)
       LIMIT 5`,
      [brokerId, client.looking_for, client.budget, clientId]
    );

    res.json({
      success: true,
      data: {
        profile: client,
        active_deals: activeDealsResult.rows,
        matches: matchesResult.rows
      }
    });

  } catch (err) {
    next(err);
  }
};

export const createDeal = async (req, res, next) => {
  const brokerId = req.user.id;
  const { client_id, property_id } = req.body;

  try {
    if (!client_id || !property_id) {
      return res.status(400).json({ success: false, message: "Client and Property IDs are required" });
    }

    const existingDeal = await query(
      `SELECT * FROM deals WHERE client_id = $1 AND property_id = $2`,
      [client_id, property_id]
    );

    if (existingDeal.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "This property is already linked to this client." 
      });
    }

    const result = await query(
      `INSERT INTO deals (broker_id, client_id, property_id, status) 
       VALUES ($1, $2, $3, 'Interested') 
       RETURNING *`,
      [brokerId, client_id, property_id]
    );

    res.status(201).json({
      success: true,
      message: "Deal started successfully!",
      data: result.rows[0]
    });

  } catch (err) {
    next(err);
  }
};


export const getDealDetails = async (req, res, next) => {
  const brokerId = req.user.id;
  const dealId = req.params.id;

  try {
    const result = await query(
      `SELECT 
        d.id as deal_id, d.status, d.created_at,
        p.id as property_id, p.title, p.address, p.city, p.price, p.cover_image_url,
        p.owner_name, p.owner_phone,
        c.id as client_id, c.name as client_name, c.phone as client_phone
       FROM deals d
       JOIN properties p ON d.property_id = p.id
       JOIN contacts c ON d.client_id = c.id
       WHERE d.id = $1 AND d.broker_id = $2`,
      [dealId, brokerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Deal not found" });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (err) {
    next(err);
  }
};


export const scheduleDealMeeting = async (req, res, next) => {
  const brokerId = req.user.id;
  const dealId = req.params.id;
  const { meeting_date, notes } = req.body;

  try {
    const dealCheck = await query(
      `SELECT d.client_id, p.title as property_title, c.name as client_name 
       FROM deals d
       JOIN properties p ON d.property_id = p.id
       JOIN contacts c ON d.client_id = c.id
       WHERE d.id = $1 AND d.broker_id = $2`,
      [dealId, brokerId]
    );

    if (dealCheck.rows.length === 0) {
      return res.status(404).json({ message: "Deal not found" });
    }
    
    const { client_id, property_title, client_name } = dealCheck.rows[0];

    await query(
      `UPDATE deals SET status = 'Meeting' WHERE id = $1`,
      [dealId]
    );

    const taskTitle = `Meeting: ${client_name} for ${property_title}`;
    
    await query(
      `INSERT INTO tasks (broker_id, title, description, due_date, status, client_id, deal_id)
       VALUES ($1, $2, $3, $4, 'pending', $5, $6)`,
      [brokerId, taskTitle, notes || 'Deal Negotiation Meeting', meeting_date, client_id, dealId]
    );

    res.json({
      success: true,
      message: "Meeting scheduled and Deal updated!",
    });

  } catch (err) {
    next(err);
  }
};


export const updateDealStage = async (req, res, next) => {
  const brokerId = req.user.id;
  const dealId = req.params.id;
  const { outcome } = req.body;
  try {
    let newStatus;
    let message;
    if (outcome === 'interested') {
      newStatus = 'Token'; 
      message = "Great! Deal moved to Token stage.";
    } else if (outcome === 'not_interested') {
      newStatus = 'Lost';  
      message = "Deal marked as Not Interested.";
    } else {
      return res.status(400).json({ success: false, message: "Invalid outcome" });
    }
    const result = await query(
      `UPDATE deals 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2 AND broker_id = $3 
       RETURNING *`,
      [newStatus, dealId, brokerId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Deal not found" });
    }
    res.json({
      success: true,
      message: message,
      data: result.rows[0]
    })
  } catch (err) {
    next(err);
  }
};

export const submitTokenPayment = async (req, res, next) => {
  const brokerId = req.user.id;
  const dealId = req.params.id;
  const { final_price, token_amount } = req.body;

  try {
    if (!final_price || !token_amount) {
      return res.status(400).json({ success: false, message: "Please enter details" });
    }
    const dealCheck = await query(
      `SELECT property_id FROM deals WHERE id = $1`, 
      [dealId]
    );
    
    if (dealCheck.rows.length === 0) return res.status(404).json({ message: "Deal not found" });
    const propertyId = dealCheck.rows[0].property_id;
    const result = await query(
      `UPDATE deals 
       SET final_price = $1, token_amount = $2, status = 'Closed', updated_at = NOW() 
       WHERE id = $3 AND broker_id = $4 
       RETURNING *`,
      [final_price, token_amount, dealId, brokerId]
    );
    await query(
      `UPDATE properties SET status = 'Sold' WHERE id = $1`,
      [propertyId]
    );
    res.json({
      success: true,
      message: "Deal Closed! Property removed from Inventory.",
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};