import { query } from '../config/db.js';

export const createProperty = async (req, res, next) => {
  const brokerId = req.user.id;

  const {
    title,             
    description,
    address,            
    city,
    price,
    category,           
    listing_type,       
    property_type,    
    bedrooms,           
    size,               
    furnishing_status,  
    owner_name,
    owner_phone,
    image_url           
  } = req.body;

  try {
    if (!address || !price || !category || !listing_type) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields." });
    }
    const finalTitle = title || `${bedrooms || ''} ${property_type} for ${listing_type} in ${address}`;

    const result = await query(
      `INSERT INTO properties (
        broker_id, 
        title, description, address, city, price, 
        category, listing_type, property_type, bedrooms, 
        plot_area_sqft, furnishing_status, 
        owner_name, owner_phone, cover_image_url
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
      RETURNING *`,
      [
        brokerId,
        finalTitle,
        description || '',
        address,
        city || 'Indore', 
        price,
        category,
        listing_type,
        property_type,
        bedrooms,
        size,
        furnishing_status,
        owner_name,
        owner_phone,
        image_url || null 
      ]
    );
    res.status(201).json({
      success: true,
      message: "Property added successfully!",
      data: result.rows[0]
    });

  } catch (err) {
    next(err);
  }
};

export const getProperties = async (req, res, next) => {
  const brokerId = req.user.id;
  const { listing_type, category, property_type } = req.query;

  try {
   let sql = "SELECT * FROM properties WHERE broker_id = $1 AND status = 'Available'";
    let params = [brokerId];
    let paramIndex = 2; 
    if (listing_type) {
      sql += ` AND listing_type = $${paramIndex}`;
      params.push(listing_type);
      paramIndex++;
    }
    if (category) {
      sql += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    if (property_type && property_type !== 'All') {
      sql += ` AND property_type = $${paramIndex}`;
      params.push(property_type);
      paramIndex++;
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

