import { query } from '../config/db.js';


export const createProperty = async (req, res, next) => {
  const brokerId = req.user.id;
  const {
    listing_type,       
    property_category,  
    property_type,      
    configuration,     
    furnishing_status,  
    state,
    city,
    locality,           
    project_name,      
    address,
    price,
    size,               
    size_unit,          
    length_ft,          
    width_ft,          
    owner_name,
    owner_phone,
    amenities,         
    bond,               
    image_url           
  } = req.body;

  try {
    if (!listing_type || !property_category || !city || !price) {
      return res.status(400).json({ 
        success: false, 
        message: "Please fill in required fields (Type, Category, City, Price)." 
      });
    }
    const generatedTitle = `${configuration || ''} ${property_type} for ${listing_type} in ${city}`;

    const result = await query(
      `INSERT INTO properties (
         broker_id, 
         listing_type, property_category, property_type,
         configuration, furnishing_status,
         state, city, locality, project_name, address,
         price, size_sqft, size_unit, length_ft, width_ft,
         owner_name, owner_phone, amenities, bond_details, cover_image_url,
         title, status
       ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, 'Available') 
       RETURNING *`,
      [
        brokerId, 
        listing_type, 
        property_category, 
        property_type,
        configuration || null,
        furnishing_status || null,
        state || '', 
        city || 'Indore', 
        locality || '', 
        project_name || '', 
        address,
        price, 
        size || 0,             
        size_unit || 'Sq. Ft.', 
        length_ft || 0, 
        width_ft || 0,
        owner_name, 
        owner_phone, 
        amenities || [],       
        bond || null,
        image_url || null,
        generatedTitle
      ]
    );
    res.status(201).json({
      success: true,
      message: "Property listed successfully!",
      data: result.rows[0]
    });
  } catch (err) {
    console.error("Create Property Error:", err);
    next(err);
  }
};

export const getProperties = async (req, res, next) => {
  const brokerId = req.user.id;
  const { 
    search, 
    category,      
    listing_type,  
    property_type, 
    status,        
    min_price, 
    max_price 
  } = req.query;
  try {
    let sql = `SELECT * FROM properties WHERE broker_id = $1`;
    let params = [brokerId];
    let paramIndex = 2;
    if (status && status !== 'All') {
        sql += ` AND status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
    }
    if (listing_type) {
      sql += ` AND listing_type = $${paramIndex}`;
      params.push(listing_type);
      paramIndex++;
    }
    if (category) {
      sql += ` AND property_category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    if (property_type && property_type !== 'All') {
      sql += ` AND property_type = $${paramIndex}`;
      params.push(property_type);
      paramIndex++;
    }
    if (min_price && max_price) {
        sql += ` AND price BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
        params.push(min_price, max_price);
        paramIndex += 2;
    }
    if (search) {
      sql += ` AND (
        city ILIKE $${paramIndex} OR 
        project_name ILIKE $${paramIndex} OR 
        locality ILIKE $${paramIndex} OR 
        owner_name ILIKE $${paramIndex} OR
        title ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    sql += ` ORDER BY created_at DESC`;
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

export const getPropertyDetails = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = await query('SELECT * FROM properties WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};