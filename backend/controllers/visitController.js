import { query } from '../config/db.js';

export const createSiteVisit = async (req, res, next) => {
  const brokerId = req.user.id;
  const { client_id, property_ids, scheduled_date, scheduled_time } = req.body;

  try {
    if (!client_id || !property_ids || property_ids.length === 0) {
      return res.status(400).json({ success: false, message: "Client and selected properties are required" });
    }
    const scheduleTimestamp = `${scheduled_date} ${scheduled_time}`;
    const visitResult = await query(
      `INSERT INTO site_visits (broker_id, client_id, scheduled_at, status) 
       VALUES ($1, $2, $3, 'scheduled') 
       RETURNING *`,
      [brokerId, client_id, scheduleTimestamp]
    );
    const visitId = visitResult.rows[0].id;
    for (const propId of property_ids) {
      await query(
        `INSERT INTO site_visit_items (site_visit_id, property_id, status, outcome) 
         VALUES ($1, $2, 'pending', 'none')`,
        [visitId, propId]
      );
    }
    const clientRes = await query(`SELECT name FROM contacts WHERE id = $1`, [client_id]);
    const clientName = clientRes.rows[0]?.name || 'Client';
    
    await query(
      `INSERT INTO tasks (broker_id, client_id, title, description, due_date, status, task_type, site_visit_id)
       VALUES ($1, $2, $3, $4, $5, 'pending', 'Site Visit', $6)`,
      [brokerId, client_id, `Site Visit: ${clientName}`, `Visiting ${property_ids.length} properties`, scheduleTimestamp, visitId]
    );
    res.status(201).json({
      success: true,
      message: "Site Visit Scheduled!",
      data: visitResult.rows[0]
    });

  } catch (err) {
    next(err);
  }
};

export const getVisitDetails = async (req, res, next) => {
  const visitId = req.params.id;
  try {
    const result = await query(
      `SELECT 
         i.id as item_id, i.status as visit_status, i.outcome,
         p.id as property_id, p.title, p.address, p.locality, p.price, p.cover_image_url, 
         p.owner_name, p.owner_phone, p.map_location
       FROM site_visit_items i
       JOIN properties p ON i.property_id = p.id
       WHERE i.site_visit_id = $1
       ORDER BY i.created_at ASC`, 
      [visitId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
};

export const submitVisitFeedback = async (req, res, next) => {
  const itemId = req.params.itemId; 
  const { outcome, notes } = req.body; 

  try {
    const updateResult = await query(
      `UPDATE site_visit_items 
       SET outcome = $1, status = 'visited', notes = $2 
       WHERE id = $3 
       RETURNING *`,
      [outcome, notes || '', itemId]
    );
    if (updateResult.rows.length === 0) return res.status(404).json({ message: "Item not found" });
    const item = updateResult.rows[0];
    if (outcome === 'interested') {
      const visitInfo = await query(`SELECT broker_id, client_id FROM site_visits WHERE id = $1`, [item.site_visit_id]);
      const { broker_id, client_id } = visitInfo.rows[0];
      const dealCheck = await query(`SELECT id FROM deals WHERE client_id = $1 AND property_id = $2`, [client_id, item.property_id]);
      if (dealCheck.rows.length === 0) {
        await query(
          `INSERT INTO deals (broker_id, client_id, property_id, status) 
           VALUES ($1, $2, $3, 'Interested')`,
          [broker_id, client_id, item.property_id]
        );
      }
    }

    res.json({
      success: true,
      message: "Feedback recorded!",
      data: item
    });

  } catch (err) {
    next(err);
  }
};

export const getPropertiesByOutcome = async (req, res, next) => {
  const visitId = req.params.id;
  const outcomeFilter = req.query.outcome;
  try {
    let sqlQuery = `
      SELECT 
         i.id as item_id, i.status as visit_status, i.outcome,
         p.id as property_id, p.title, p.address, p.locality, p.price, p.cover_image_url, 
         p.owner_name, p.owner_phone, p.map_location
      FROM site_visit_items i
      JOIN properties p ON i.property_id = p.id
      WHERE i.site_visit_id = $1
    `;
    const queryParams = [visitId];
    if (outcomeFilter) {
      sqlQuery += ` AND i.outcome = $2`;
      queryParams.push(outcomeFilter);
    }
    sqlQuery += ` ORDER BY i.created_at ASC`;
    const result = await query(sqlQuery, queryParams);
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
};