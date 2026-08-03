import { query } from '../config/db.js';

export const createProperty = async (req, res, next) => {
  const brokerId = req.user.id;
  const {
    listing_type, category, property_category, property_type,
    configuration, furnishing_status, state, city, locality,
    project_name, address, price, size, size_unit, length_ft,
    width_ft, owner_name, owner_phone, amenities, bond, image_url
  } = req.body;

  try {
    if (!listing_type || !category || !city || !price) {
      return res.status(400).json({
        success: false,
        message: "Please fill in required fields (Type, Category, City, Price)."
      });
    }

    const generatedTitle = project_name || address || `${configuration || ''} ${property_type} for ${listing_type} in ${city}`.trim();

    const result = await query(
      `INSERT INTO properties (
         broker_id, listing_type, category, property_category, property_type,
         configuration, furnishing_status, state, city, locality, project_name, address,
         price, size_sqft, size_unit, length_ft, width_ft,
         owner_name, owner_phone, amenities, bond_details, cover_image_url,
         title, status
       ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24) 
       RETURNING *`,
      [
        brokerId, listing_type, category, property_category, property_type,
        configuration || null, furnishing_status || null, state || '',
        city || 'Indore', locality || '', project_name || '', address,
        price, size || 0, size_unit || 'Sq. Ft.', length_ft || 0, width_ft || 0,
        owner_name, owner_phone, amenities || [], bond || null, image_url || null,
        generatedTitle, 'Pending'
      ]
    );

    res.status(201).json({ success: true, message: "Property listed successfully!", data: result.rows[0] });
  } catch (err) {
    console.error("=== Create Property Error ===", err);
    next(err);
  }
};

export const updateProperty = async (req, res, next) => {
  const brokerId = req.user.id;
  const { id } = req.params;
  const {
    listing_type, category, property_category, property_type,
    configuration, furnishing_status, state, city, locality,
    project_name, address, price, size, size_unit, length_ft,
    width_ft, owner_name, owner_phone, amenities, bond, image_url
  } = req.body;

  try {
    // 1. GET FIX: Make sure the property isn't deleted before updating
    const checkResult = await query(
      'SELECT * FROM properties WHERE id = $1 AND broker_id = $2 AND is_deleted = false',
      [id, brokerId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Property not found or you don't have permission to edit it." });
    }

    if (!listing_type || !category || !city || !price) {
      return res.status(400).json({ success: false, message: "Please fill in required fields (Type, Category, City, Price)." });
    }

    const generatedTitle = project_name || address || `${configuration || ''} ${property_type} for ${listing_type} in ${city}`.trim();

    const result = await query(
      `UPDATE properties SET
         listing_type = $1, category = $2, property_category = $3, property_type = $4,
         configuration = $5, furnishing_status = $6, state = $7, city = $8,
         locality = $9, project_name = $10, address = $11, price = $12,
         size_sqft = $13, size_unit = $14, length_ft = $15, width_ft = $16,
         owner_name = $17, owner_phone = $18, amenities = $19, bond_details = $20,
         cover_image_url = $21, title = $22, updated_at = NOW()
       WHERE id = $23 AND broker_id = $24 AND is_deleted = false
       RETURNING *`,
      [
        listing_type, category, property_category, property_type,
        configuration || null, furnishing_status || null, state || '',
        city || 'Indore', locality || '', project_name || '', address,
        price, size || 0, size_unit || 'Sq. Ft.', length_ft || 0, width_ft || 0,
        owner_name, owner_phone, amenities || [], bond || null, image_url || null,
        generatedTitle, id, brokerId
      ]
    );

    res.status(200).json({ success: true, message: "Property updated successfully!", data: result.rows[0] });
  } catch (err) {
    console.error("=== Update Property Error ===", err);
    next(err);
  }
};

export const getProperties = async (req, res, next) => {
  const brokerId = req.user.id;
  const { search, status, type } = req.query; // 'type' can be 'mine', 'network', or 'all'

  try {
    // THE MAGIC SQL: Fetch my properties OR properties shared with me
    let sql = `
      SELECT 
        p.*, 
        u.full_name as listed_by_name, 
        u.phone_number as listed_by_phone,
        CASE WHEN p.broker_id = $1 THEN true ELSE false END as is_mine
      FROM properties p
      JOIN users u ON p.broker_id = u.id
      WHERE p.is_deleted = false
      AND (
        p.broker_id = $1 
        OR p.id IN (
          SELECT DISTINCT UNNEST(shared_properties) 
          FROM collaborations 
          WHERE (sender_id = $1 OR receiver_id = $1) 
          AND status = 'accepted'
        )
      )
    `;
    
    const params = [brokerId];
    let paramIndex = 2;

    // Optional Frontend Filters
    if (type === 'mine') {
      sql += ` AND p.broker_id = $1`;
    } else if (type === 'network') {
      sql += ` AND p.broker_id != $1`;
    }

    if (status && status !== 'All') {
      sql += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      sql += ` AND (p.title ILIKE $${paramIndex} OR p.address ILIKE $${paramIndex} OR p.city ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ` ORDER BY p.created_at DESC`;

    const result = await query(sql, params);

    res.json({
      success: true,
      count: result.rowCount,
      data: result.rows
    });
  } catch (err) {
    console.error("Get Properties Error:", err);
    next(err);
  }
};

export const getPropertyDetails = async (req, res, next) => {
  const brokerId = req.user.id; // SECURITY FIX: Added broker ID check
  const { id } = req.params;
  try {
    // 3. GET FIX & SECURITY FIX: Check broker_id and is_deleted
    const result = await query(
      'SELECT * FROM properties WHERE id = $1 AND broker_id = $2 AND is_deleted = false', 
      [id, brokerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const deleteProperty = async (req, res, next) => {
  const brokerId = req.user.id;
  const { id } = req.params;
  try {
    const result = await query(
      `UPDATE properties SET is_deleted = true WHERE id = $1 AND broker_id = $2 RETURNING id`,
      [id, brokerId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }
    await query(
      `UPDATE deals SET is_deleted = true WHERE property_id = $1 AND broker_id = $2`, 
      [id, brokerId]
    );
    res.json({ success: true, message: "Property deleted successfully" });
  } catch (err) {
    console.error('=== Delete Property Error ===', err);
    next(err);
  }
};