import { query } from '../config/db.js';

// 1. Connection request endpoints (legacy compatibility)
export const sendConnectionRequest = async (req, res, next) => {
  const senderId = req.user.id;
  const { phone } = req.body;

  try {
    if (!phone) return res.status(400).json({ success: false, message: "Phone number is required" });

    const userLookup = await query(`SELECT id, full_name FROM users WHERE phone_number = $1`, [phone]);
    if (userLookup.rowCount === 0) return res.status(404).json({ success: false, message: "Broker not found" });

    const receiverId = userLookup.rows[0].id;
    if (senderId === receiverId) return res.status(400).json({ message: "Cannot collab with yourself" });

    const existing = await query(`SELECT * FROM collaborations WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)`, [senderId, receiverId]);
    if (existing.rows.length > 0) return res.status(400).json({ message: "Request already exists" });

    await query(`INSERT INTO collaborations (sender_id, receiver_id, status) VALUES ($1, $2, 'pending')`, [senderId, receiverId]);
    res.status(201).json({ success: true, message: "Request Sent!" });
  } catch (err) { next(err); }
};

export const getPendingRequests = async (req, res, next) => {
  const myId = req.user.id;
  try {
    const sql = `
      SELECT c.id as request_id, u.full_name, u.city as location, u.phone_number
      FROM collaborations c
      JOIN users u ON u.id = c.sender_id
      WHERE c.receiver_id = $1 AND c.status = 'pending'
    `;
    const result = await query(sql, [myId]);
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

export const updateConnectionStatus = async (req, res, next) => {
  const myId = req.user.id;
  const { requestId } = req.params;
  const { status } = req.body; // 'accepted' or 'rejected'
  try {
    const result = await query(
      `UPDATE collaborations SET status = $1, updated_at = NOW() 
       WHERE id = $2 AND receiver_id = $3 RETURNING *`,
      [status, requestId, myId]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Request not found" });
    res.json({ success: true, message: `Collaboration ${status}` });
  } catch (err) { next(err); }
};

export const getMyNetwork = async (req, res, next) => {
  const myId = req.user.id;
  try {
    const sql = `
      SELECT c.id as collab_id, c.shared_properties, u.id as user_id, u.full_name, u.city as location, u.phone_number
      FROM collaborations c
      JOIN users u ON (u.id = c.sender_id OR u.id = c.receiver_id)
      WHERE (c.sender_id = $1 OR c.receiver_id = $1) AND c.status = 'accepted' AND u.id != $1
    `;
    const result = await query(sql, [myId]);
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

export const getSharedProperties = async (req, res, next) => {
  const { collabId } = req.params;
  const myId = req.user.id;
  try {
    const collab = await query(
      `SELECT shared_properties FROM collaborations 
       WHERE id = $1 AND (sender_id = $2 OR receiver_id = $2)`,
      [collabId, myId]
    );

    if (collab.rowCount === 0) return res.status(404).json({ message: "Collaboration not found" });

    const propertyIds = collab.rows[0].shared_properties;
    if (!propertyIds || propertyIds.length === 0) return res.json({ success: true, data: [] });

    const properties = await query(
      `SELECT id, title, address, city, price, cover_image_url FROM properties WHERE id = ANY($1)`,
      [propertyIds]
    );

    res.json({ success: true, data: properties.rows });
  } catch (err) { next(err); }
};

export const shareProperties = async (req, res, next) => {
  const { collabId } = req.params;
  const { propertyId } = req.body;
  const myId = req.user.id;
  try {
    await query(
      `UPDATE collaborations 
       SET shared_properties = array_append(shared_properties, $1)
       WHERE id = $2 AND (sender_id = $3 OR receiver_id = $3) 
       AND NOT ($1 = ANY(shared_properties))`,
      [propertyId, collabId, myId]
    );
    res.json({ success: true, message: "Property shared successfully" });
  } catch (err) { next(err); }
};

export const removeSharedProperty = async (req, res, next) => {
  const { collabId, propertyId } = req.params;
  const myId = req.user.id;
  try {
    await query(
      `UPDATE collaborations 
       SET shared_properties = array_remove(shared_properties, $1)
       WHERE id = $2 AND (sender_id = $3 OR receiver_id = $3)`,
      [propertyId, collabId, myId]
    );
    res.json({ success: true, message: "Property removed from collaboration" });
  } catch (err) { next(err); }
};

export const removeConnection = async (req, res, next) => {
  const { collabId } = req.params;
  const myId = req.user.id;
  try {
    const result = await query(
      `DELETE FROM collaborations WHERE id = $1 AND (sender_id = $2 OR receiver_id = $2) RETURNING id`,
      [collabId, myId]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "Collaboration not found" });
    res.json({ success: true, message: "Connection removed" });
  } catch (err) { next(err); }
};


// 2. Dynamic 10km Haversine Matchmaking Endpoints
export const getMatchingProperties = async (req, res, next) => {
  const { client_id } = req.query;
  const brokerId = req.user.id;
  try {
    if (!client_id) return res.status(400).json({ success: false, message: "Client ID is required" });
    
    const clientRes = await query(`SELECT * FROM contacts WHERE id = $1 AND is_deleted = false`, [client_id]);
    if (clientRes.rowCount === 0) return res.status(404).json({ success: false, message: "Client not found" });
    const client = clientRes.rows[0];

    const sql = `
      SELECT p.*,
             u.full_name AS broker_name,
             CASE 
               WHEN p.latitude IS NOT NULL AND p.longitude IS NOT NULL AND $1::double precision IS NOT NULL AND $2::double precision IS NOT NULL
               THEN (6371 * acos(
                   least(1.0, greatest(-1.0, 
                       cos(radians($1)) * cos(radians(p.latitude)) *
                       cos(radians(p.longitude) - radians($2)) +
                       sin(radians($1)) * sin(radians(p.latitude))
                   ))
               ))
               ELSE NULL
             END AS distance,
             (
               20 + (CASE WHEN $3 ILIKE '%' || p.configuration || '%' THEN 30 ELSE 0 END) + 
               (CASE WHEN p.price >= $4 AND p.price <= $5 THEN 30 ELSE 0 END) + 
               (CASE 
                  WHEN p.locality ILIKE '%' || $6 || '%' OR $6 ILIKE '%' || p.locality || '%' 
                  THEN 20 
                  ELSE 0 
                END) 
             ) AS compatibility,
             (
               SELECT stage FROM collab_rooms 
               WHERE client_id = $10 AND property_id = p.id
               LIMIT 1
             ) AS request_status
      FROM properties p
      JOIN users u ON u.id = p.broker_id
      WHERE p.is_deleted = false AND p.status = 'Available'
        AND p.broker_id != $7
        AND p.property_category = $8
        AND p.listing_type = CASE WHEN $9 = 'Buy' THEN 'Sell' ELSE 'Rent' END
        AND (
          (p.latitude IS NOT NULL AND p.longitude IS NOT NULL AND $1::double precision IS NOT NULL AND $2::double precision IS NOT NULL AND
           (6371 * acos(
               least(1.0, greatest(-1.0, 
                   cos(radians($1)) * cos(radians(p.latitude)) *
                   cos(radians(p.longitude) - radians($2)) +
                   sin(radians($1)) * sin(radians(p.latitude))
               ))
           )) <= 10.0)
          OR
          (($1::double precision IS NULL OR $2::double precision IS NULL OR p.latitude IS NULL OR p.longitude IS NULL) AND
           (p.city ILIKE '%' || $6 || '%' OR p.locality ILIKE '%' || $6 || '%' OR $6 ILIKE '%' || p.locality || '%'))
        )
      ORDER BY compatibility DESC, distance ASC NULLS LAST;
    `;

    const result = await query(sql, [
      client.latitude,
      client.longitude,
      client.configuration,
      client.budget_min,
      client.budget_max,
      client.preferred_location,
      brokerId,
      client.property_category,
      client.requirement_type,
      client_id
    ]);

    const transformedRows = await Promise.all(result.rows.map(async (prop) => {
      if (prop.broker_id !== brokerId) {
        const collabResult = await query(
          'SELECT stage FROM collab_rooms WHERE property_id = $1 AND (broker_1_id = $2 OR broker_2_id = $2) AND is_active = true LIMIT 1',
          [prop.id, brokerId]
        );
        const isCollabAccepted = collabResult.rows.length > 0;
        if (!isCollabAccepted) {
          prop.owner_name = 'XXXXXXXXXX';
          prop.owner_phone = 'XXXXXXXXXX';
          prop.house_no = 'Hidden';
          prop.landmark = 'Hidden';
          
          let pincodeVal = prop.pincode || '';
          if (!pincodeVal) {
            const pinMatch = (prop.address || '').match(/(.*) - (\d{6})$/);
            if (pinMatch) {
              pincodeVal = pinMatch[2];
            }
          }
          
          const locParts = (prop.locality || '').split(',').map(p => p.trim()).filter(Boolean);
          let area = locParts[0] || '';
          let city = prop.city || locParts[1] || '';
          
          prop.address = `${area}, ${city}, ${prop.state || ''} - ${pincodeVal}`.replace(/^,\s*|,\s*$/, '').trim();
          prop.project_name = 'Hidden Project';
          prop.title = `${prop.configuration ? prop.configuration + ' ' : ''}${prop.property_type} in ${area || city || 'Mumbai'}`;
        }
      }
      return prop;
    }));

    res.json({ success: true, data: transformedRows });
  } catch (err) { next(err); }
};

export const getMatchingClients = async (req, res, next) => {
  const { property_id } = req.query;
  const brokerId = req.user.id;
  try {
    if (!property_id) return res.status(400).json({ success: false, message: "Property ID is required" });

    const propRes = await query(`SELECT * FROM properties WHERE id = $1 AND is_deleted = false`, [property_id]);
    if (propRes.rowCount === 0) return res.status(404).json({ success: false, message: "Property not found" });
    const property = propRes.rows[0];

    const sql = `
      SELECT c.*,
             u.full_name AS broker_name,
             CASE 
               WHEN $1::double precision IS NOT NULL AND $2::double precision IS NOT NULL AND c.latitude IS NOT NULL AND c.longitude IS NOT NULL
               THEN (6371 * acos(
                   least(1.0, greatest(-1.0, 
                       cos(radians(c.latitude)) * cos(radians($1)) *
                       cos(radians($2) - radians(c.longitude)) +
                       sin(radians(c.latitude)) * sin(radians($1))
                   ))
               ))
               ELSE NULL
             END AS distance,
             (
               20 + (CASE WHEN c.configuration ILIKE '%' || $3 || '%' THEN 30 ELSE 0 END) + 
               (CASE WHEN $4 >= c.budget_min AND $4 <= c.budget_max THEN 30 ELSE 0 END) + 
               (CASE 
                  WHEN c.preferred_location ILIKE '%' || $5 || '%' OR $5 ILIKE '%' || c.preferred_location || '%' 
                  THEN 20 
                  ELSE 0 
                END) 
             ) AS compatibility,
             (
               SELECT stage FROM collab_rooms 
               WHERE property_id = $10 AND client_id = c.id
               LIMIT 1
             ) AS request_status
      FROM contacts c
      JOIN users u ON u.id = c.broker_id
      WHERE c.is_deleted = false AND c.status NOT IN ('Closed', 'Completed')
        AND c.broker_id != $6
        AND c.property_category = $7
        AND c.requirement_type = CASE WHEN $8 = 'Sell' THEN 'Buy' ELSE 'Rent/Lease' END
        AND (
          ($1::double precision IS NOT NULL AND $2::double precision IS NOT NULL AND c.latitude IS NOT NULL AND c.longitude IS NOT NULL AND
           (6371 * acos(
               least(1.0, greatest(-1.0, 
                   cos(radians(c.latitude)) * cos(radians($1)) *
                   cos(radians($2) - radians(c.longitude)) +
                   sin(radians(c.latitude)) * sin(radians($1))
               ))
           )) <= 10.0)
          OR
          (($1::double precision IS NULL OR $2::double precision IS NULL OR c.latitude IS NULL OR c.longitude IS NULL) AND
           (c.preferred_location ILIKE '%' || $5 || '%' OR c.preferred_location ILIKE '%' || $9 || '%' OR $5 ILIKE '%' || c.preferred_location || '%'))
        )
      ORDER BY compatibility DESC, distance ASC NULLS LAST;
    `;

    const result = await query(sql, [
      property.latitude,
      property.longitude,
      property.configuration,
      property.price,
      property.locality,
      brokerId,
      property.property_category,
      property.listing_type,
      property.city,
      property_id
    ]);

    const transformedRows = await Promise.all(result.rows.map(async (client) => {
      if (client.broker_id !== brokerId) {
        const collabResult = await query(
          'SELECT stage FROM collab_rooms WHERE property_id = $1 AND client_id = $2 AND is_active = true LIMIT 1',
          [property_id, client.id]
        );
        const isCollabAccepted = collabResult.rows.length > 0;
        if (!isCollabAccepted) {
          client.name = 'XXXXXXXXXX';
          client.phone = 'XXXXXXXXXX';
          
          if (client.preferred_location) {
            const locs = client.preferred_location.split(';').map(l => l.trim()).filter(Boolean);
            const shortenedLocs = locs.map(loc => {
              const parts = loc.split(',').map(p => p.trim()).filter(Boolean);
              return parts.length >= 2 ? parts.slice(0, 2).join(', ') : loc;
            });
            client.preferred_location = shortenedLocs.join('; ');
          }
        }
      }
      return client;
    }));

    res.json({ success: true, data: transformedRows });
  } catch (err) { next(err); }
};

export const getMatchOpportunities = async (req, res, next) => {
  const brokerId = req.user.id;
  try {
    const sql = `
      WITH my_clients AS (
        SELECT * FROM contacts WHERE broker_id = $1 AND is_deleted = false AND status NOT IN ('Closed', 'Completed')
      ),
      matching_properties AS (
        SELECT 
          mc.id as client_id,
          mc.name as client_name,
          p.id as property_id,
          p.title as property_title,
          u.full_name as broker_name,
          p.price::numeric as price_min,
          p.price::numeric as price_max,
          p.configuration,
          p.locality as loc_text,
          'MATCHING PROPERTY' as tag,
          (
            20 + (CASE WHEN mc.configuration ILIKE '%' || p.configuration || '%' THEN 30 ELSE 0 END) + 
            (CASE WHEN p.price >= mc.budget_min AND p.price <= mc.budget_max THEN 30 ELSE 0 END) + 
            (CASE 
               WHEN p.locality ILIKE '%' || mc.preferred_location || '%' OR mc.preferred_location ILIKE '%' || p.locality || '%' 
               THEN 20 
               ELSE 0 
             END) 
          ) AS compatibility
        FROM my_clients mc
        CROSS JOIN properties p
        JOIN users u ON u.id = p.broker_id
        WHERE p.is_deleted = false AND p.status = 'Available'
          AND p.broker_id != $1
          AND p.property_category = mc.property_category
          AND p.listing_type = CASE WHEN mc.requirement_type = 'Buy' THEN 'Sell' ELSE 'Rent' END
          AND NOT EXISTS (
            SELECT 1 FROM collab_rooms 
            WHERE property_id = p.id AND client_id = mc.id
          )
      ),
      my_properties AS (
        SELECT * FROM properties WHERE broker_id = $1 AND is_deleted = false AND status = 'Available'
      ),
      matching_clients AS (
        SELECT 
          p.id as property_id,
          p.title as property_title,
          c.id as client_id,
          c.name as client_name,
          u.full_name as broker_name,
          c.budget_min as price_min,
          c.budget_max as price_max,
          c.configuration,
          c.preferred_location as loc_text,
          'MATCHING CLIENT' as tag,
          (
            20 + (CASE WHEN c.configuration ILIKE '%' || p.configuration || '%' THEN 30 ELSE 0 END) + 
            (CASE WHEN p.price >= c.budget_min AND p.price <= c.budget_max THEN 30 ELSE 0 END) + 
            (CASE 
               WHEN c.preferred_location ILIKE '%' || p.locality || '%' OR p.locality ILIKE '%' || c.preferred_location || '%' 
               THEN 20 
               ELSE 0 
             END) 
          ) AS compatibility
        FROM my_properties p
        CROSS JOIN contacts c
        JOIN users u ON u.id = c.broker_id
        WHERE c.is_deleted = false AND c.status NOT IN ('Closed', 'Completed')
          AND c.broker_id != $1
          AND c.property_category = p.property_category
          AND c.requirement_type = CASE WHEN p.listing_type = 'Sell' THEN 'Buy' ELSE 'Rent/Lease' END
          AND NOT EXISTS (
            SELECT 1 FROM collab_rooms 
            WHERE property_id = p.id AND client_id = c.id
          )
      ),
      all_matches AS (
        SELECT client_id, client_name, property_id, property_title, broker_name, price_min, price_max, configuration, loc_text, tag, compatibility FROM matching_properties
        UNION ALL
        SELECT client_id, client_name, property_id, property_title, broker_name, price_min, price_max, configuration, loc_text, tag, compatibility FROM matching_clients
      )
      SELECT * FROM all_matches 
      ORDER BY compatibility DESC 
      LIMIT 5;
    `;
    const result = await query(sql, [brokerId]);
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};


// 3. Workspace (Collab Rooms) APIs
export const sendProposal = async (req, res, next) => {
  const senderId = req.user.id;
  const { property_id, client_id, role, proposed_split, message } = req.body;
  try {
    if (!property_id || !client_id || !role) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const existing = await query(
      `SELECT * FROM collab_rooms WHERE property_id = $1 AND client_id = $2`,
      [property_id, client_id]
    );
    if (existing.rowCount > 0) {
      return res.status(400).json({ success: false, message: "A collaboration proposal already exists for this match" });
    }

    const propRes = await query(`SELECT broker_id FROM properties WHERE id = $1`, [property_id]);
    const clientRes = await query(`SELECT broker_id FROM contacts WHERE id = $1`, [client_id]);
    if (propRes.rowCount === 0 || clientRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Property or Client not found" });
    }

    let broker_2_id = null;
    let broker_1_role = role;
    let broker_2_role = role === 'Property-side' ? 'Client-side' : 'Property-side';

    if (role === 'Property-side') {
      broker_2_id = clientRes.rows[0].broker_id;
    } else {
      broker_2_id = propRes.rows[0].broker_id;
    }

    if (senderId === broker_2_id) {
      return res.status(400).json({ success: false, message: "You cannot collaborate with yourself" });
    }

    const result = await query(
      `INSERT INTO collab_rooms (
         property_id, client_id, broker_1_id, broker_2_id, broker_1_role, broker_2_role, commission_split, stage, last_proposed_by
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Matched', $8) RETURNING *`,
      [property_id, client_id, senderId, broker_2_id, broker_1_role, broker_2_role, proposed_split || '50/50', senderId]
    );

    res.status(201).json({ success: true, message: "Collaboration proposal sent!", data: result.rows[0] });
  } catch (err) { next(err); }
};

export const updateSplitProposal = async (req, res, next) => {
  const myId = req.user.id;
  const { roomId } = req.params;
  const { commission_split, status, counter_note } = req.body; // status is 'Accepted' or 'Countered'
  try {
    console.log('Update split request body:', req.body);
    let stage = 'Matched';
    if (status === 'Accepted') {
      stage = 'Visit';
    }

    const result = await query(
      `UPDATE collab_rooms 
       SET commission_split = COALESCE($1, commission_split),
           stage = CASE WHEN $2 = 'Accepted' THEN 'Visit'::varchar ELSE stage END,
           last_proposed_by = $4,
           counter_note = CASE WHEN $2 = 'Countered' THEN $5 ELSE NULL END,
           is_active = true,
           updated_at = NOW()
       WHERE id = $3 AND (broker_1_id = $4 OR broker_2_id = $4)
       RETURNING *`,
      [commission_split || null, status, roomId, myId, counter_note || null]
    );

    if (result.rowCount === 0) return res.status(404).json({ success: false, message: "Collaboration room not found" });

    // If accepted, automatically move the client (contact) status and deal status to 'Site Visit'
    if (status === 'Accepted' && result.rows[0].client_id) {
      await query(
        `UPDATE contacts 
         SET status = 'Site Visit' 
         WHERE id = $1`,
        [result.rows[0].client_id]
      );
      
      // Also update the associated deal status to 'Site Visit' if it exists
      if (result.rows[0].property_id) {
        await query(
          `UPDATE deals 
           SET status = 'Site Visit', updated_at = NOW() 
           WHERE client_id = $1 AND property_id = $2`,
          [result.rows[0].client_id, result.rows[0].property_id]
        );
      }
    }

    res.json({ success: true, message: `Proposal ${status}`, data: result.rows[0] });
  } catch (err) { next(err); }
};

export const closeCollabRoom = async (req, res, next) => {
  const myId = req.user.id;
  const { roomId } = req.params;
  try {
    const result = await query(
      `UPDATE collab_rooms 
       SET stage = 'Closed', is_active = false, updated_at = NOW()
       WHERE id = $1 AND (broker_1_id = $2 OR broker_2_id = $2)
       RETURNING *`,
      [roomId, myId]
    );
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: "Collaboration room not found" });

    // Sync associated deal status to Lost
    await query(
      `UPDATE deals 
       SET status = 'Lost', updated_at = NOW() 
       WHERE client_id = $1 AND property_id = $2 AND is_deleted = false`,
      [result.rows[0].client_id, result.rows[0].property_id]
    );

    res.json({ success: true, message: "Collaboration workspace closed successfully.", data: result.rows[0] });
  } catch (err) { next(err); }
};

export const startDeal = async (req, res, next) => {
  const myId = req.user.id;
  const { roomId } = req.params;
  try {
    const roomRes = await query(`SELECT * FROM collab_rooms WHERE id = $1`, [roomId]);
    if (roomRes.rowCount === 0) return res.status(404).json({ success: false, message: "Collaboration room not found" });
    const room = roomRes.rows[0];

    if (room.broker_1_id !== myId && room.broker_2_id !== myId) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    await query(`UPDATE collab_rooms SET stage = 'Deal', updated_at = NOW() WHERE id = $1`, [roomId]);

    // Update contact status to 'In-Process'
    await query(`UPDATE contacts SET status = 'In-Process' WHERE id = $1`, [room.client_id]);

    // Fetch property price to populate expected_price
    const propRes = await query(`SELECT price FROM properties WHERE id = $1`, [room.property_id]);
    const propertyPrice = propRes.rows[0]?.price || null;

    const dealRes = await query(
      `INSERT INTO deals (broker_id, client_id, property_id, status, expected_price) VALUES ($1, $2, $3, 'Negotiation', $4) RETURNING id`,
      [myId, room.client_id, room.property_id, propertyPrice]
    );
    const dealId = dealRes.rows[0].id;

    const deactivatedRes = await query(
      `UPDATE collab_rooms 
       SET is_active = false, stage = 'Closed', updated_at = NOW()
       WHERE property_id = $1 AND client_id = $2 AND id != $3
       RETURNING id`,
      [room.property_id, room.client_id, roomId]
    );
    const deactivatedRoomIds = deactivatedRes.rows.map(r => r.id);

    res.json({
      success: true,
      message: "Deal started. Competitor workspaces deactivated.",
      data: {
        dealId,
        roomId,
        stage: "Deal",
        deactivatedRoomIds
      }
    });
  } catch (err) { next(err); }
};

export const settleSplit = async (req, res, next) => {
  const myId = req.user.id;
  const { roomId } = req.params;
  try {
    // 1. Fetch the collab room first
    const roomRes = await query(
      `SELECT * FROM collab_rooms WHERE id = $1 AND (broker_1_id = $2 OR broker_2_id = $2)`,
      [roomId, myId]
    );
    if (roomRes.rowCount === 0) return res.status(404).json({ success: false, message: "Collaboration room not found" });

    const room = roomRes.rows[0];
    
    // 2. Determine which broker is clicking and set settled to true
    let updateField = '';
    if (room.broker_1_id === myId) {
      updateField = 'broker_1_settled = true';
      room.broker_1_settled = true;
    } else if (room.broker_2_id === myId) {
      updateField = 'broker_2_settled = true';
      room.broker_2_settled = true;
    }

    if (!updateField) return res.status(403).json({ success: false, message: "Unauthorized" });

    // 3. If both are now true, set commission_status to Paid
    let commissionStatus = 'Pending';
    if (room.broker_1_settled && room.broker_2_settled) {
      commissionStatus = 'Paid';
    }

    const result = await query(
      `UPDATE collab_rooms 
       SET ${updateField}, commission_status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [commissionStatus, roomId]
    );

    res.json({
      success: true,
      message: commissionStatus === 'Paid' ? "Commission split fully settled and Paid!" : "Settle marked. Waiting for partner.",
      data: {
        roomId,
        commission_status: result.rows[0].commission_status,
        broker_1_settled: result.rows[0].broker_1_settled,
        broker_2_settled: result.rows[0].broker_2_settled,
        settled_at: new Date()
      }
    });
  } catch (err) { next(err); }
};

export const getActiveRooms = async (req, res, next) => {
  const myId = req.user.id;
  try {
    const sql = `
      SELECT cr.*,
             p.title as property_title, p.address as property_address, p.price as property_price, p.cover_image_url as property_image,
             p.locality as property_locality, p.city as property_city,
             p.owner_name as property_owner_name, p.owner_phone as property_owner_phone,
             c.name as client_name, c.phone as client_phone, c.preferred_location as client_preferred_location,
             c.status as client_stage,
             u1.full_name as broker_1_name, u1.phone_number as broker_1_phone,
             u2.full_name as broker_2_name, u2.phone_number as broker_2_phone,
             (SELECT d.id FROM deals d 
              WHERE d.client_id = cr.client_id AND d.property_id = cr.property_id AND d.is_deleted = false 
              LIMIT 1) as deal_id,
             (SELECT d.status FROM deals d 
              WHERE d.client_id = cr.client_id AND d.property_id = cr.property_id AND d.is_deleted = false 
              LIMIT 1) as deal_status
      FROM collab_rooms cr
      JOIN properties p ON p.id = cr.property_id
      JOIN contacts c ON c.id = cr.client_id
      JOIN users u1 ON u1.id = cr.broker_1_id
      JOIN users u2 ON u2.id = cr.broker_2_id
      WHERE (cr.broker_1_id = $1 OR cr.broker_2_id = $1)
      ORDER BY cr.updated_at DESC
    `;
    const result = await query(sql, [myId]);
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};


// 4. Checklist Tasks APIs
export const getCollabTasks = async (req, res, next) => {
  const { roomId } = req.params;
  const myId = req.user.id;
  try {
    const sql = `
      SELECT * FROM collab_tasks 
      WHERE room_id = $1 
        AND (visibility = 'Shared' OR assigned_to = $2)
      ORDER BY created_at ASC
    `;
    const result = await query(sql, [roomId, myId]);
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

export const createCollabTask = async (req, res, next) => {
  const { roomId } = req.params;
  const { title, visibility, note } = req.body;
  const myId = req.user.id;
  try {
    const result = await query(
      `INSERT INTO collab_tasks (room_id, title, visibility, note, assigned_to)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [roomId, title, visibility || 'Shared', note || '', myId]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

export const updateCollabTask = async (req, res, next) => {
  const { taskId } = req.params;
  const { completed, title, visibility, note } = req.body;
  const myId = req.user.id;
  try {
    const result = await query(
      `UPDATE collab_tasks 
       SET completed = COALESCE($1, completed),
           title = COALESCE($2, title),
           visibility = COALESCE($3, visibility),
           note = COALESCE($4, note),
           updated_at = NOW()
       WHERE id = $5 AND (visibility = 'Shared' OR assigned_to = $6)
       RETURNING *`,
      [completed === undefined ? null : completed, title || null, visibility || null, note || null, taskId, myId]
    );
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: "Task not found or access denied" });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

export const deleteCollabTask = async (req, res, next) => {
  const { taskId } = req.params;
  const myId = req.user.id;
  try {
    const result = await query(
      `DELETE FROM collab_tasks WHERE id = $1 AND assigned_to = $2 RETURNING id`,
      [taskId, myId]
    );
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: "Task not found or you are not the creator" });
    res.json({ success: true, message: "Task deleted successfully" });
  } catch (err) { next(err); }
};


// 5. Site Visit APIs
export const getCollabVisits = async (req, res, next) => {
  const { roomId } = req.params;
  try {
    const result = await query(
      `SELECT * FROM collab_visits WHERE room_id = $1 ORDER BY scheduled_time ASC`,
      [roomId]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

export const scheduleCollabVisit = async (req, res, next) => {
  const { roomId } = req.params;
  const { scheduled_time, client_name, outcome_notes } = req.body;
  try {
    const roomRes = await query(
      `SELECT cr.*, p.address as property_address, p.locality as property_locality
       FROM collab_rooms cr
       JOIN properties p ON p.id = cr.property_id
       WHERE cr.id = $1`, 
      [roomId]
    );
    if (roomRes.rowCount === 0) return res.status(404).json({ success: false, message: "Collaboration room not found" });
    const room = roomRes.rows[0];

    const result = await query(
      `INSERT INTO collab_visits (room_id, scheduled_time, client_name, status, outcome_notes)
       VALUES ($1, $2, $3, 'Confirmed', $4) RETURNING *`,
      [roomId, scheduled_time, client_name, outcome_notes || '']
    );

    const title = `Site Visit with ${client_name}`;
    const desc = outcome_notes || `Location: ${room.property_address || room.property_locality || 'Indore'}`;
    await query(
      `INSERT INTO tasks (broker_id, client_id, property_id, title, description, task_type, due_date, status)
       VALUES ($1, $2, $3, $4, $5, 'Site Visit', $6, 'pending')`,
      [room.broker_1_id, room.client_id, room.property_id, title, desc, scheduled_time]
    );
    await query(
      `INSERT INTO tasks (broker_id, client_id, property_id, title, description, task_type, due_date, status)
       VALUES ($1, $2, $3, $4, $5, 'Site Visit', $6, 'pending')`,
      [room.broker_2_id, room.client_id, room.property_id, title, desc, scheduled_time]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

export const updateCollabVisit = async (req, res, next) => {
  const { visitId } = req.params;
  const { status, outcome_notes } = req.body;
  try {
    const result = await query(
      `UPDATE collab_visits
       SET status = COALESCE($1, status),
           outcome_notes = COALESCE($2, outcome_notes),
           updated_at = NOW()
       WHERE id = $3 RETURNING *`,
      [status || null, outcome_notes || null, visitId]
    );
    if (result.rowCount === 0) return res.status(404).json({ success: false, message: "Site visit not found" });

    const visit = result.rows[0];

    // If marked Completed, sync status to CRM tasks
    if (status === 'Completed') {
      const roomRes = await query(`SELECT * FROM collab_rooms WHERE id = $1`, [visit.room_id]);
      if (roomRes.rowCount > 0) {
        const room = roomRes.rows[0];
        // Mark site visit tasks for this client & property as completed for both brokers
        await query(
          `UPDATE tasks 
           SET status = 'completed', updated_at = NOW() 
           WHERE client_id = $1 AND property_id = $2 AND task_type = 'Site Visit'`,
          [room.client_id, room.property_id]
        );
      }
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};