import { query } from '../config/db.js';


export const createProperty = async (req, res, next) => {
  const brokerId = req.user.id;
  
  console.log('=== Received Request Body ===', req.body);
  console.log('=== Broker ID ===', brokerId);
  
  const {
    listing_type,
    category,           
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
    if (!listing_type || !category || !city || !price) {
      console.log('=== Validation Failed ===', { listing_type, category, city, price });
      return res.status(400).json({ 
        success: false, 
        message: "Please fill in required fields (Type, Category, City, Price)." 
      });
    }
    
    const generatedTitle = project_name || address || `${configuration || ''} ${property_type} for ${listing_type} in ${city}`.trim();
    
    console.log('=== Generated Title ===', generatedTitle);
    console.log('=== Inserting into DB ===');

    const result = await query(
      `INSERT INTO properties (
         broker_id, 
         listing_type, category, property_category, property_type,
         configuration, furnishing_status,
         state, city, locality, project_name, address,
         price, size_sqft, size_unit, length_ft, width_ft,
         owner_name, owner_phone, amenities, bond_details, cover_image_url,
         title, status
       ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24) 
       RETURNING *`,
      [
        brokerId, 
        listing_type,
        category,              
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
        generatedTitle,
        'Available'
      ]
    );
    
    console.log('=== Property Created Successfully ===', result.rows[0]);
    
    res.status(201).json({
      success: true,
      message: "Property listed successfully!",
      data: result.rows[0]
    });
  } catch (err) {
    console.error("=== Create Property Error ===", err);
    console.error("Error details:", err.message);
    next(err);
  }
};

export const updateProperty = async (req, res, next) => {
  const brokerId = req.user.id;
  const { id } = req.params;
  
  console.log('=== Update Property Request ===');
  console.log('Property ID:', id);
  console.log('Broker ID:', brokerId);
  console.log('Request Body:', req.body);
  
  const {
    listing_type,
    category,           
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
    // Check if property exists and belongs to broker
    const checkResult = await query(
      'SELECT * FROM properties WHERE id = $1 AND broker_id = $2',
      [id, brokerId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Property not found or you don't have permission to edit it." 
      });
    }

    if (!listing_type || !category || !city || !price) {
      console.log('=== Validation Failed ===', { listing_type, category, city, price });
      return res.status(400).json({ 
        success: false, 
        message: "Please fill in required fields (Type, Category, City, Price)." 
      });
    }
    
    const generatedTitle = project_name || address || `${configuration || ''} ${property_type} for ${listing_type} in ${city}`.trim();
    
    console.log('=== Generated Title ===', generatedTitle);
    console.log('=== Updating in DB ===');

    const result = await query(
      `UPDATE properties SET
         listing_type = $1,
         category = $2,
         property_category = $3,
         property_type = $4,
         configuration = $5,
         furnishing_status = $6,
         state = $7,
         city = $8,
         locality = $9,
         project_name = $10,
         address = $11,
         price = $12,
         size_sqft = $13,
         size_unit = $14,
         length_ft = $15,
         width_ft = $16,
         owner_name = $17,
         owner_phone = $18,
         amenities = $19,
         bond_details = $20,
         cover_image_url = $21,
         title = $22,
         updated_at = NOW()
       WHERE id = $23 AND broker_id = $24
       RETURNING *`,
      [
        listing_type,
        category,              
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
        generatedTitle,
        id,
        brokerId
      ]
    );
    
    console.log('=== Property Updated Successfully ===', result.rows[0]);
    
    res.status(200).json({
      success: true,
      message: "Property updated successfully!",
      data: result.rows[0]
    });
  } catch (err) {
    console.error("=== Update Property Error ===", err);
    console.error("Error details:", err.message);
    next(err);
  }
};

export const getProperties = async (req, res, next) => {
  const brokerId = req.user.id;
  const { search, category, listing_type, property_type, min_price, max_price } = req.query;
  
  console.log('=== Get Properties Request ===');
  console.log('Broker ID:', brokerId);
  console.log('Query params:', { search, category, listing_type, property_type, min_price, max_price });
  
  try {
    let sql = `SELECT * FROM properties WHERE broker_id = $1 AND status = 'Available'`;
    let params = [brokerId];
    let paramIndex = 2;
    
    if (listing_type) {
      sql += ` AND listing_type = $${paramIndex}`;
      params.push(listing_type);
      paramIndex++;
    }
    if (category) {
      sql += ` AND (category = $${paramIndex} OR property_category = $${paramIndex})`;
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
      sql += ` AND (city ILIKE $${paramIndex} OR project_name ILIKE $${paramIndex} OR locality ILIKE $${paramIndex} OR owner_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    sql += ` ORDER BY created_at DESC`;
    
    console.log('=== SQL Query ===', sql);
    console.log('=== Params ===', params);
    
    const result = await query(sql, params);
    
    console.log('=== Properties Found ===', result.rowCount);
    
    res.json({
      success: true,
      count: result.rowCount,
      data: result.rows
    });
  } catch (err) {
    console.error('=== Get Properties Error ===', err);
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
