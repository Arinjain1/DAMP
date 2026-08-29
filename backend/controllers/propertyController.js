import { query } from '../config/db.js';
import { geocodeAddress } from '../utils/geocoder.js';

export const createProperty = async (req, res, next) => {
  const brokerId = req.user.id;
  const {
    listing_type, category, property_category, property_type,
    configuration, furnishing_status, state, city, locality,
    project_name, address, price, size, size_unit, length_ft,
    width_ft, owner_name, owner_phone, amenities, bond, image_url,
    house_no, landmark, pincode
  } = req.body;

  try {
    if (!listing_type || !category || !city || !price) {
      return res.status(400).json({
        success: false,
        message: "Please fill in required fields (Type, Category, City, Price)."
      });
    }

    let lat = req.body.latitude;
    let lng = req.body.longitude;
    if (lat === undefined || lng === undefined || lat === null || lng === null) {
      const coords = await geocodeAddress(`${locality || ''} ${city || ''} ${state || ''}`.trim() || address);
      lat = coords.latitude;
      lng = coords.longitude;
    }

    const fullAddress = `${house_no || ''}, ${landmark || ''}, ${locality || ''}, ${city || ''}, ${state || ''} - ${pincode || ''}`.replace(/^,\s*|,\s*$/, '').replace(/\s*,\s*,/g, ',').trim();
    const generatedTitle = project_name || fullAddress || `${configuration || ''} ${property_type} for ${listing_type} in ${city}`.trim();

    const result = await query(
      `INSERT INTO properties (
         broker_id, listing_type, category, property_category, property_type,
         configuration, furnishing_status, state, city, locality, project_name, address,
         price, size_sqft, size_unit, length_ft, width_ft,
         owner_name, owner_phone, amenities, bond_details, cover_image_url,
         title, status, latitude, longitude, house_no, landmark, pincode
       ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29) 
       RETURNING *`,
      [
        brokerId, listing_type, category, property_category, property_type,
        configuration || null, furnishing_status || null, state || '',
        city || 'Indore', locality || '', project_name || '', fullAddress,
        price, size || 0, size_unit || 'Sq. Ft.', length_ft || 0, width_ft || 0,
        owner_name, owner_phone, amenities || [], bond || null, image_url || null,
        generatedTitle, 'Pending', lat, lng, house_no || null, landmark || null, pincode || null
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
    width_ft, owner_name, owner_phone, amenities, bond, image_url,
    house_no, landmark, pincode
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

    let lat = req.body.latitude;
    let lng = req.body.longitude;
    if (lat === undefined || lng === undefined || lat === null || lng === null) {
      const coords = await geocodeAddress(`${locality || ''} ${city || ''} ${state || ''}`.trim() || address);
      lat = coords.latitude;
      lng = coords.longitude;
    }

    const fullAddress = `${house_no || ''}, ${landmark || ''}, ${locality || ''}, ${city || ''}, ${state || ''} - ${pincode || ''}`.replace(/^,\s*|,\s*$/, '').replace(/\s*,\s*,/g, ',').trim();
    const generatedTitle = project_name || fullAddress || `${configuration || ''} ${property_type} for ${listing_type} in ${city}`.trim();

    const result = await query(
      `UPDATE properties SET
         listing_type = $1, category = $2, property_category = $3, property_type = $4,
         configuration = $5, furnishing_status = $6, state = $7, city = $8,
         locality = $9, project_name = $10, address = $11, price = $12,
         size_sqft = $13, size_unit = $14, length_ft = $15, width_ft = $16,
         owner_name = $17, owner_phone = $18, amenities = $19, bond_details = $20,
         cover_image_url = $21, title = $22, latitude = $23, longitude = $24,
         house_no = $25, landmark = $26, pincode = $27, updated_at = NOW()
       WHERE id = $28 AND broker_id = $29 AND is_deleted = false
       RETURNING *`,
      [
        listing_type, category, property_category, property_type,
        configuration || null, furnishing_status || null, state || '',
        city || 'Indore', locality || '', project_name || '', fullAddress,
        price, size || 0, size_unit || 'Sq. Ft.', length_ft || 0, width_ft || 0,
        owner_name, owner_phone, amenities || [], bond || null, image_url || null,
        generatedTitle, lat, lng, house_no || null, landmark || null, pincode || null, id, brokerId
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

    res.json({
      success: true,
      count: result.rowCount,
      data: transformedRows
    });
  } catch (err) {
    console.error("Get Properties Error:", err);
    next(err);
  }
};

export const getPropertyDetails = async (req, res, next) => {
  const brokerId = req.user.id;
  const { id } = req.params;
  try {
    const result = await query(
      'SELECT * FROM properties WHERE id = $1 AND is_deleted = false AND (broker_id = $2 OR status = \'Available\')', 
      [id, brokerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    const property = result.rows[0];
    const isOwner = property.broker_id === brokerId;

    if (!isOwner) {
      const collabResult = await query(
        'SELECT stage FROM collab_rooms WHERE property_id = $1 AND (broker_1_id = $2 OR broker_2_id = $2) AND is_active = true LIMIT 1',
        [id, brokerId]
      );
      const isCollabAccepted = collabResult.rows.length > 0;
      if (!isCollabAccepted) {
        property.ownerPhone = 'XXXXXXXXXX';
        property.owner_phone = 'XXXXXXXXXX';
        property.owner_name = 'XXXXXXXXXX';
        property.house_no = 'Hidden';
        property.landmark = 'Hidden';
        
        let pincodeVal = property.pincode || '';
        if (!pincodeVal) {
          const pinMatch = (property.address || '').match(/(.*) - (\d{6})$/);
          if (pinMatch) {
            pincodeVal = pinMatch[2];
          }
        }
        
        const locParts = (property.locality || '').split(',').map(p => p.trim()).filter(Boolean);
        let area = locParts[0] || '';
        let city = property.city || locParts[1] || '';
        
        property.address = `${area}, ${city}, ${property.state || ''} - ${pincodeVal}`.replace(/^,\s*|,\s*$/, '').trim();
        property.project_name = 'Hidden Project';
        property.title = `${property.configuration ? property.configuration + ' ' : ''}${property.property_type} in ${area || city || 'Mumbai'}`;
      }
    }

    res.json({ success: true, data: property });
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