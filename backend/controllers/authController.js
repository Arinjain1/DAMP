import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d', 
  });
};

export const registerUser = async (req, res) => {
  const { full_name, email, password, phone_number } = req.body;

  try {
    const userExists = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await query(
      `INSERT INTO users (full_name, email, password_hash, phone_number, role, auth_provider) 
       VALUES ($1, $2, $3, $4, 'broker', 'email') 
       RETURNING id, full_name, email, role`,
      [full_name, email, hashedPassword, phone_number]
    );

    const user = newUser.rows[0];
    res.status(201).json({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    });

  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ message: 'Server Error during registration' });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
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