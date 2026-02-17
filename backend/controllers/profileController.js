import { query } from '../config/db.js';

export const getProfile = async (req, res, next) => {
  const userId = req.user.id;

  try {
    
    
    const result = await query(
      'SELECT id, full_name, email, phone_number, role, age, city, created_at FROM users WHERE id = $1',
      [userId]
    );


    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (err) {
    console.error("Get Profile Error:", err);
    console.error("Error details:", err.message);
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  const userId = req.user.id;
  const { full_name, phone_number, age, city } = req.body;

  try {
    if (!full_name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const result = await query(
      `UPDATE users 
       SET full_name = $1, phone_number = $2, age = $3, city = $4
       WHERE id = $5
       RETURNING id, full_name, email, phone_number, role, age, city, created_at`,
      [full_name, phone_number || null, age || null, city || null, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully!",
      data: result.rows[0]
    });

  } catch (err) {
    console.error("Update Profile Error:", err);
    next(err);
  }
};
