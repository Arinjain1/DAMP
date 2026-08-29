import { query } from '../config/db.js';

export const getProfile = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const result = await query(
      'SELECT id, full_name, email, phone_number, role, age, city, avatar, created_at FROM users WHERE id = $1',
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
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  const userId = req.user.id;
  const { full_name, phone_number, age, city, avatar } = req.body;

  try {
    const userRes = await query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const currentUser = userRes.rows[0];

    const updatedName = full_name !== undefined ? full_name : currentUser.full_name;
    const updatedPhone = phone_number !== undefined ? phone_number : currentUser.phone_number;
    const updatedAge = age !== undefined ? age : currentUser.age;
    const updatedCity = city !== undefined ? city : currentUser.city;
    const updatedAvatar = avatar !== undefined ? avatar : currentUser.avatar;

    if (!updatedName) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const result = await query(
      `UPDATE users 
       SET full_name = $1, phone_number = $2, age = $3, city = $4, avatar = $5
       WHERE id = $6
       RETURNING id, full_name, email, phone_number, role, age, city, avatar, created_at`,
      [updatedName, updatedPhone || null, updatedAge || null, updatedCity || null, updatedAvatar || null, userId]
    );

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
