import { query } from '../config/db.js';


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

// 2. Get Pending Requests (Screenshot "Requests" tab)
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

// 3. Accept/Reject Request (UI Buttons)
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

// 4. Get My Network (Screenshot 1 - Main List)
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

// 5. Get Specific Shared Properties (To show the list in Screenshot 1)
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

// 6. Share a Property (Screenshot 2 - Add button)
export const shareProperties = async (req, res, next) => {
  const { collabId } = req.params;
  const { propertyId } = req.body; // UI sends the ID of the property to add
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

// 7. Remove Single Shared Property (Screenshot 1 - Individual "Remove" button)
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

// 8. Remove Entire Connection (Delete the whole collaboration)
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