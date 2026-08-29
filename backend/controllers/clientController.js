import { query } from '../config/db.js';
import { geocodeAddress } from '../utils/geocoder.js';

export const addClient = async (req, res, next) => {
  const brokerId = req.user.id;
  const { name, phone, requirement_type, property_category, property_type, configuration, furnishing_status, budget_min, budget_max, preferred_location, notes, profile_image, city, state, pincode } = req.body;
  try {
    if (!name || !phone) return res.status(400).json({ success: false, message: "Name and Phone are required" });
    
    let lat = req.body.latitude;
    let lng = req.body.longitude;
    if (lat === undefined || lng === undefined || lat === null || lng === null) {
      const coords = await geocodeAddress(preferred_location);
      lat = coords.latitude;
      lng = coords.longitude;
    }

    const result = await query(
      `INSERT INTO contacts (
         broker_id, name, phone, requirement_type, property_category, property_type, 
         configuration, furnishing_status, budget_min, budget_max, preferred_location, notes, status, latitude, longitude, profile_image,
         city, state, pincode
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'New', $13, $14, $15, $16, $17, $18) 
       RETURNING *`,
      [brokerId, name, phone, requirement_type, property_category, property_type, configuration, furnishing_status, budget_min || 0, budget_max || 0, preferred_location || '', notes || '', lat, lng, profile_image || null, city || '', state || '', pincode || '']
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
        (SELECT COUNT(*) FROM deals d WHERE d.client_id = c.id AND d.status NOT IN ('Closed', 'Completed', 'Lost') AND d.is_deleted = false) as active_deal_count,
        (SELECT row_to_json(t) FROM (
           SELECT title, due_date, task_type FROM tasks 
           WHERE client_id = c.id AND status = 'pending' 
           ORDER BY due_date ASC LIMIT 1
         ) t) as next_task,
        (SELECT id FROM collab_rooms 
         WHERE client_id = c.id AND is_active = true AND NOT (stage = 'Closed' AND updated_at < NOW() - INTERVAL '7 days') 
         LIMIT 1) as collaboration_room_id,
        (SELECT commission_status FROM collab_rooms 
         WHERE client_id = c.id AND is_active = true AND NOT (stage = 'Closed' AND updated_at < NOW() - INTERVAL '7 days') 
         LIMIT 1) as commission_status,
        (SELECT broker_1_id FROM collab_rooms 
         WHERE client_id = c.id AND is_active = true AND NOT (stage = 'Closed' AND updated_at < NOW() - INTERVAL '7 days') 
         LIMIT 1) as broker_1_id,
        (SELECT broker_2_id FROM collab_rooms 
         WHERE client_id = c.id AND is_active = true AND NOT (stage = 'Closed' AND updated_at < NOW() - INTERVAL '7 days') 
         LIMIT 1) as broker_2_id,
        (SELECT broker_1_settled FROM collab_rooms 
         WHERE client_id = c.id AND is_active = true AND NOT (stage = 'Closed' AND updated_at < NOW() - INTERVAL '7 days') 
         LIMIT 1) as broker_1_settled,
        (SELECT broker_2_settled FROM collab_rooms 
         WHERE client_id = c.id AND is_active = true AND NOT (stage = 'Closed' AND updated_at < NOW() - INTERVAL '7 days') 
         LIMIT 1) as broker_2_settled,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM collab_rooms 
            WHERE client_id = c.id AND is_active = true AND NOT (stage = 'Closed' AND updated_at < NOW() - INTERVAL '7 days')
          ) THEN true 
          ELSE false 
        END as collaborated
      FROM contacts c 
      WHERE (c.broker_id = $1 OR EXISTS (
        SELECT 1 FROM collab_rooms cr 
        WHERE cr.client_id = c.id 
          AND cr.stage != 'Matched' 
          AND NOT (cr.stage = 'Closed' AND cr.updated_at < NOW() - INTERVAL '7 days')
          AND cr.is_active = true
          AND (cr.broker_1_id = $1 OR cr.broker_2_id = $1)
      )) AND c.is_deleted = false
      AND NOT (c.status = 'Completed' AND c.updated_at < NOW() - INTERVAL '7 days')
    `;
    let params = [brokerId];
    if (search) {
      sql += ' AND (c.name ILIKE $2 OR c.phone ILIKE $2)';
      params.push(`%${search}%`);
    }
    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);

    const transformedData = await Promise.all(result.rows.map(async (client) => {
      let name = client.name;
      let phone = client.phone;

      if (client.broker_id !== brokerId) {
        const collabRes = await query(
          `SELECT 1 FROM collab_rooms 
           WHERE client_id = $1 
             AND is_active = true 
             AND (broker_1_id = $2 OR broker_2_id = $2)
           LIMIT 1`,
          [client.id, brokerId]
        );
        if (collabRes.rowCount === 0) {
          name = client.name + ' (Matched Client)';
          phone = 'XXXXXXXXXX';
        }
      }

      return {
        ...client,
        name,
        phone,
        selectedProperties: client.selected_properties || [],
        interestedProperties: client.interested_properties || [],
        holdProperties: client.hold_properties || []
      };
    }));
    
    res.json({
      success: true,
      count: result.rowCount,
      data: transformedData
    });
  } catch (err) {
    next(err);
  }
};

export const updateClient = async (req, res, next) => {
  const brokerId = req.user.id;
  const clientId = req.params.id;
  const { 
    name, phone, requirement_type, property_category, property_type, 
    configuration, furnishing_status, budget_min, budget_max, 
    preferred_location, notes, selected_properties, interested_properties, hold_properties, profile_image,
    city, state, pincode
  } = req.body;

  try {
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: "Name and Phone are required" });
    }

    let lat = req.body.latitude;
    let lng = req.body.longitude;
    if (lat === undefined || lng === undefined || lat === null || lng === null) {
      if (preferred_location !== undefined) {
        const coords = await geocodeAddress(preferred_location);
        lat = coords.latitude;
        lng = coords.longitude;
      }
    }

    let updateFields = [
      'name = $1', 'phone = $2', 
      'requirement_type = $3', 'property_category = $4', 'property_type = $5', 
      'configuration = $6', 'furnishing_status = $7', 
      'budget_min = $8', 'budget_max = $9', 'preferred_location = $10', 'notes = $11',
      'city = $12', 'state = $13', 'pincode = $14'
    ];
    
    let values = [
      name, phone, requirement_type, property_category, property_type, 
      configuration, furnishing_status, budget_min || 0, budget_max || 0, preferred_location || '', notes || '',
      city || '', state || '', pincode || ''
    ];

    if (lat !== undefined && lat !== null) {
      updateFields.push(`latitude = $${values.length + 1}`);
      values.push(lat);
    }
    if (lng !== undefined && lng !== null) {
      updateFields.push(`longitude = $${values.length + 1}`);
      values.push(lng);
    }
    if (profile_image !== undefined) {
      updateFields.push(`profile_image = $${values.length + 1}`);
      values.push(profile_image);
    }

    let paramIndex = values.length + 1;
    if (selected_properties !== undefined) {
      updateFields.push(`selected_properties = $${paramIndex}`);
      values.push(selected_properties);
      paramIndex++;
    }

    if (interested_properties !== undefined) {
      updateFields.push(`interested_properties = $${paramIndex}`);
      values.push(interested_properties);
      paramIndex++;
    }

    if (hold_properties !== undefined) {
      updateFields.push(`hold_properties = $${paramIndex}`);
      values.push(hold_properties);
      paramIndex++;
    }
    values.push(clientId, brokerId);
    const result = await query(
      `UPDATE contacts 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramIndex} AND broker_id = $${paramIndex + 1}
       RETURNING *`,
      values
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
    const clientResult = await query('SELECT * FROM contacts WHERE id = $1 AND is_deleted = false', [clientId]);
    if (clientResult.rows.length === 0) return res.status(404).json({ message: "Client not found" });
    
    const client = clientResult.rows[0];
    const isOwner = client.broker_id === brokerId;

    if (!isOwner) {
      const collabResult = await query(
        'SELECT stage FROM collab_rooms WHERE client_id = $1 AND (broker_1_id = $2 OR broker_2_id = $2) AND is_active = true LIMIT 1',
        [clientId, brokerId]
      );
      const isCollabAccepted = collabResult.rows.length > 0;
      if (!isCollabAccepted) {
        client.phone = 'XXXXXXXXXX';
        client.email = 'masked@brokerapp.com';
        client.name = client.name + ' (Matched Client)';
      }
    }

    const activeDealsResult = await query(
      `SELECT d.id, d.status, p.title, p.address, p.price, p.cover_image_url 
       FROM deals d
       JOIN properties p ON d.property_id = p.id
       WHERE d.client_id = $1 AND d.status NOT IN ('Closed', 'Completed', 'Lost') AND d.is_deleted = false`,
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
    const transformedClient = {
      ...client,
      selectedProperties: client.selected_properties || [],
      interestedProperties: client.interested_properties || [],
      holdProperties: client.hold_properties || []
    };

    res.json({
      success: true,
      data: {
        profile: transformedClient,
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
      `UPDATE contacts 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2 
         AND (
           broker_id = $3 
           OR EXISTS (
             SELECT 1 FROM collab_rooms 
             WHERE client_id = $2 
               AND (broker_1_id = $3 OR broker_2_id = $3) 
               AND is_active = true
           )
         )
       RETURNING *`,
      [status, clientId, brokerId]
    );

    // Synchronize active deal status in the deals table
    const dealStatusMap = {
      'New': 'Interested',
      'Contacted': 'Interested',
      'Site Visit': 'Site Visit',
      'Interested': 'Interested',
      'Negotiation': 'Negotiation',
      'Token': 'Token',
      'Agreement': 'Agreement',
      'Completed': 'Completed'
    };
    const newDealStatus = dealStatusMap[status];
    if (newDealStatus) {
      await query(
        `UPDATE deals 
         SET status = $1, updated_at = NOW() 
         WHERE client_id = $2 
           AND (
             property_id IN (
               SELECT property_id FROM collab_rooms 
               WHERE client_id = $2 AND is_active = true
             )
             OR NOT EXISTS (
               SELECT 1 FROM collab_rooms 
               WHERE client_id = $2 AND is_active = true
             )
           )
           AND is_deleted = false`,
        [newDealStatus, clientId]
      );
    }

    if (status === 'Completed') {
      await query(
        `UPDATE properties 
         SET status = 'Sold', updated_at = NOW() 
         WHERE id IN (
           SELECT property_id FROM deals 
           WHERE client_id = $1 AND is_deleted = false
         )`,
        [clientId]
      );
    }

    // Synchronize to collab_rooms if a collaboration exists
    const collabStageMap = {
      'New': 'Matched',
      'Contacted': 'Matched',
      'Site Visit': 'Visit',
      'Interested': 'Matched',
      'Negotiation': 'Deal',
      'Token': 'Deal',
      'Agreement': 'Deal',
      'Completed': 'Completed',
      'Lost': 'Closed'
    };
    const newCollabStage = collabStageMap[status];
    if (newCollabStage) {
      await query(
        `UPDATE collab_rooms 
         SET stage = $1, updated_at = NOW() 
         WHERE client_id = $2 AND is_active = true`,
        [newCollabStage, clientId]
      );
    }

    res.json({ success: true, message: `Moved to ${status}`, data: result.rows[0] });
  } catch (err) { next(err); }
};

export const updateClientProperties = async (req, res, next) => {
  const brokerId = req.user.id;
  const clientId = req.params.id;
  const { selected_properties, interested_properties, hold_properties } = req.body;

  try {
    let updateFields = [];
    let values = [];
    let paramIndex = 1;

    if (selected_properties !== undefined) {
      updateFields.push(`selected_properties = $${paramIndex}`);
      values.push(selected_properties);
      paramIndex++;
    }

    if (interested_properties !== undefined) {
      updateFields.push(`interested_properties = $${paramIndex}`);
      values.push(interested_properties);
      paramIndex++;
    }

    if (hold_properties !== undefined) {
      updateFields.push(`hold_properties = $${paramIndex}`);
      values.push(hold_properties);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: "No properties to update" });
    }

    values.push(clientId, brokerId);

    const result = await query(
      `UPDATE contacts 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramIndex} 
         AND (
           broker_id = $${paramIndex + 1}
           OR EXISTS (
             SELECT 1 FROM collab_rooms 
             WHERE client_id = $${paramIndex} 
               AND (broker_1_id = $${paramIndex + 1} OR broker_2_id = $${paramIndex + 1}) 
               AND is_active = true
           )
         )
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }
    const transformedClient = {
      ...result.rows[0],
      selectedProperties: result.rows[0].selected_properties || [],
      interestedProperties: result.rows[0].interested_properties || [],
      holdProperties: result.rows[0].hold_properties || []
    };

    res.json({
      success: true,
      message: "Properties updated successfully!",
      data: transformedClient
    });

  } catch (err) {
    console.error("Update Client Properties Error:", err);
    next(err);
  }
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
        d.client_id, d.property_id,
        p.title as property_title, p.address as property_address, p.city, p.cover_image_url,
        c.name as client_name, c.phone as client_phone
      FROM deals d
      JOIN properties p ON d.property_id = p.id
      JOIN contacts c ON d.client_id = c.id
      WHERE (d.broker_id = $1 OR EXISTS (
        SELECT 1 FROM collab_rooms cr
        WHERE cr.client_id = d.client_id 
          AND cr.property_id = d.property_id 
          AND cr.is_active = true 
          AND (cr.broker_1_id = $1 OR cr.broker_2_id = $1)
      )) AND d.is_deleted = false AND c.is_deleted = false
    `;
    const params = [brokerId];
    if (status && status !== 'All') {
      if (status === 'New') sql += ` AND d.status = 'Interested'`; 
      else if (status === 'Contacted') sql += ` AND d.status IN ('Contacted', 'Meeting')`;
      else if (status === 'Site Visit') sql += ` AND d.status = 'Site Visit'`;
      else if (status === 'Negotiation') sql += ` AND d.status = 'Negotiation'`;
      else if (status === 'Closed') sql += ` AND d.status IN ('Token', 'Closed', 'Completed')`;
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
    const existingDeal = await query(`SELECT * FROM deals WHERE client_id = $1 AND property_id = $2 AND is_deleted = false`, [client_id, property_id]);
    if (existingDeal.rows.length > 0) return res.status(400).json({ success: false, message: "Deal already exists for this client and property" });
    // Fetch property price to populate expected_price
    const propRes = await query(`SELECT price FROM properties WHERE id = $1`, [property_id]);
    const propertyPrice = propRes.rows[0]?.price || null;

    const result = await query(`INSERT INTO deals (broker_id, client_id, property_id, status, expected_price) VALUES ($1, $2, $3, 'In-Process', $4) RETURNING *`, [brokerId, client_id, property_id, propertyPrice]);
    res.status(201).json({ success: true, message: "Deal started!", data: result.rows[0] });
  } catch (err) { next(err); }
};

export const getDealDetails = async (req, res, next) => {
  const brokerId = req.user.id;
  const dealId = req.params.id;
  try {
    const result = await query(
      `SELECT d.id as deal_id, d.status, d.created_at, d.final_price, d.token_amount, d.expected_price,
        p.id as property_id, p.title, p.address, p.city, p.price, p.cover_image_url, p.owner_name, p.owner_phone,
        c.id as client_id, c.name as client_name, c.phone as client_phone
       FROM deals d JOIN properties p ON d.property_id = p.id JOIN contacts c ON d.client_id = c.id
       WHERE d.id = $1 AND (d.broker_id = $2 OR EXISTS (
         SELECT 1 FROM collab_rooms cr
         WHERE cr.client_id = d.client_id 
           AND cr.property_id = d.property_id 
           AND cr.is_active = true 
           AND (cr.broker_1_id = $2 OR cr.broker_2_id = $2)
       )) AND d.is_deleted = false`, [dealId, brokerId]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Deal not found" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

export const scheduleDealMeeting = async (req, res, next) => {
  const brokerId = req.user.id;
  const dealId = req.params.id;
  const { meeting_date, notes } = req.body;
  try {
    const dealCheck = await query(
      `SELECT d.client_id, p.title as property_title, c.name as client_name 
       FROM deals d JOIN properties p ON d.property_id = p.id JOIN contacts c ON d.client_id = c.id 
       WHERE d.id = $1 AND (d.broker_id = $2 OR EXISTS (
         SELECT 1 FROM collab_rooms cr
         WHERE cr.client_id = d.client_id 
           AND cr.property_id = d.property_id 
           AND cr.is_active = true 
           AND (cr.broker_1_id = $2 OR cr.broker_2_id = $2)
       ))`, [dealId, brokerId]);
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
    else if (outcome === 'meeting') newStatus = 'Meeting';
    else if (outcome === 'site_visit') newStatus = 'Site Visit';
    else if (outcome === 'negotiation') newStatus = 'Negotiation';
    else if (outcome === 'token') newStatus = 'Token';
    else if (outcome === 'agreement') newStatus = 'Agreement';
    else if (outcome === 'not_interested' || outcome === 'lost') newStatus = 'Lost';
    else return res.status(400).json({ message: "Invalid outcome" });
    const result = await query(
      `UPDATE deals SET status = $1, updated_at = NOW() 
       WHERE id = $2 AND (broker_id = $3 OR EXISTS (
         SELECT 1 FROM collab_rooms cr
         WHERE cr.client_id = deals.client_id 
           AND cr.property_id = deals.property_id 
           AND cr.is_active = true 
           AND (cr.broker_1_id = $3 OR cr.broker_2_id = $3)
       )) RETURNING *`, [newStatus, dealId, brokerId]);
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
    await query(
      `UPDATE deals SET final_price = $1, token_amount = $2, status = 'Closed', updated_at = NOW() 
       WHERE id = $3 AND (broker_id = $4 OR EXISTS (
         SELECT 1 FROM collab_rooms cr
         WHERE cr.client_id = deals.client_id 
           AND cr.property_id = deals.property_id 
           AND cr.is_active = true 
           AND (cr.broker_1_id = $4 OR cr.broker_2_id = $4)
       ))`, [final_price, token_amount, dealId, brokerId]);
    await query(`UPDATE properties SET status = 'Sold' WHERE id = $1`, [propertyId]);
    const receiptData = await query(`SELECT d.id as deal_id, d.token_amount, d.final_price, d.updated_at, c.name as client_name, p.title as property_title FROM deals d JOIN contacts c ON d.client_id = c.id JOIN properties p ON d.property_id = p.id WHERE d.id = $1`, [dealId]);
    res.json({ success: true, message: "Deal Closed!", data: receiptData.rows[0] });
  } catch (err) { next(err); }
};

export const deleteClient = async (req, res, next) => {
  const brokerId = req.user.id;
  const clientId = req.params.id;
  try {
    const result = await query(
      `UPDATE contacts SET is_deleted = true WHERE id = $1 AND broker_id = $2 RETURNING id`,
      [clientId, brokerId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }
    await query(
      `UPDATE deals SET is_deleted = true WHERE client_id = $1 AND broker_id = $2`, 
      [clientId, brokerId]
    );
    res.json({ success: true, message: "Client deleted successfully" });
  } catch (err) {
    next(err);
  }
};

export const deleteDeal = async (req, res, next) => {
  const brokerId = req.user.id;
  const dealId = req.params.id;
  try {
    const result = await query(
      `UPDATE deals SET is_deleted = true 
       WHERE id = $1 AND (broker_id = $2 OR EXISTS (
         SELECT 1 FROM collab_rooms cr
         WHERE cr.client_id = deals.client_id 
           AND cr.property_id = deals.property_id 
           AND cr.is_active = true 
           AND (cr.broker_1_id = $2 OR cr.broker_2_id = $2)
       )) RETURNING id`,
      [dealId, brokerId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Deal not found" });
    }
    res.json({ success: true, message: "Deal deleted successfully" });
  } catch (err) {
    next(err);
  }
};