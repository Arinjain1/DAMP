import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// IMPORTANT: Make sure your db.js exports 'pool' alongside 'query'
import { query, pool } from '../config/db.js';

// Helper function to generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d', 
  });
};

export const registerUser = async (req, res) => {
  const { full_name, email, password, phone_number, age, city } = req.body;

  // 1. Checkout a dedicated client for the transaction
  const client = await pool.connect();

  try {
    // 2. Start the transaction (If anything fails below, everything is undone)
    await client.query('BEGIN');

    // Check if user already exists
    const userExists = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      await client.query('ROLLBACK'); 
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insert User
    const newUserResult = await client.query(
      `INSERT INTO users (full_name, email, password_hash, phone_number, age, city, role, auth_provider) 
       VALUES ($1, $2, $3, $4, $5, $6, 'broker', 'email') 
       RETURNING id, full_name, email, role, age, city`,
      [full_name, email, hashedPassword, phone_number, age || null, city || '']
    );
    
    const newUser = newUserResult.rows[0];

    // 4. Insert 7-Day Free Trial Subscription
    await client.query(
      `INSERT INTO subscriptions (broker_id, plan_name, status, valid_until) 
       VALUES ($1, 'trial', 'active', NOW() + INTERVAL '7 days')`,
      [newUser.id]
    );

    // 5. If both queries succeeded, permanently save them to the database
    await client.query('COMMIT');

    // Send the success response
    res.status(201).json({
      id: newUser.id,
      full_name: newUser.full_name,
      email: newUser.email,
      role: newUser.role,
      token: generateToken(newUser.id, newUser.role),
    });

  } catch (err) {
    // 6. If an error happens, undo any partial changes
    await client.query('ROLLBACK');
    console.error("Register Error:", err.message);
    res.status(500).json({ message: 'Server Error during registration' });
  } finally {
    // 7. Always release the client back to the pool so it can be reused
    client.release();
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Standard query is fine here since we aren't modifying multiple tables
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      res.json({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ message: 'Server Error during login' });
  }
};