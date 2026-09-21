import jwt from 'jsonwebtoken';
import { query, pool } from '../config/db.js';
import {
  generateOtpToken,
  verifyOtpToken,
  sendOtpViaFast2Sms,
  cleanPhoneNumber,
} from '../utils/smsService.js';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

/**
 * Send OTP to user's phone via Fast2SMS using stateless JWT token
 */
export const sendOtp = async (req, res) => {
  const { phone_number } = req.body;
  if (!phone_number) {
    return res.status(400).json({ success: false, message: 'Phone number is required' });
  }

  const cleanPhone = cleanPhoneNumber(phone_number);
  if (!cleanPhone || cleanPhone.length !== 10) {
    return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number' });
  }

  try {
    const { otp, verificationToken } = generateOtpToken(cleanPhone);

    // Send SMS via Fast2SMS
    await sendOtpViaFast2Sms(cleanPhone, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your mobile number',
      phone_number: cleanPhone,
      verification_token: verificationToken,
    });
  } catch (err) {
    console.error('Send OTP Error:', err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to send OTP via SMS',
    });
  }
};

/**
 * Verify submitted OTP using stateless verification JWT token
 */
export const verifyOtp = async (req, res) => {
  const { phone_number, otp, verification_token } = req.body;

  if (!phone_number || !otp || !verification_token) {
    return res.status(400).json({
      success: false,
      message: 'Phone number, OTP, and verification token are required',
    });
  }

  const cleanPhone = cleanPhoneNumber(phone_number);
  const verifyResult = verifyOtpToken(cleanPhone, otp, verification_token);

  if (!verifyResult.valid) {
    return res.status(400).json({
      success: false,
      message: verifyResult.message,
    });
  }

  try {
    // Check if user exists with this phone number
    const result = await query(
      'SELECT id, full_name, email, phone_number, role, age, city FROM users WHERE phone_number = $1',
      [cleanPhone]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const token = generateToken(user.id, user.role || 'broker');

      return res.status(200).json({
        success: true,
        isNewUser: false,
        token,
        user: {
          id: user.id,
          name: user.full_name,
          full_name: user.full_name,
          email: user.email,
          phone_number: user.phone_number,
          role: user.role,
        },
      });
    }

    // User does not exist yet; prompt to complete registration
    res.status(200).json({
      success: true,
      isNewUser: true,
      phone_number: cleanPhone,
      verification_token,
      message: 'OTP verified successfully. Please enter your name to complete registration.',
    });
  } catch (err) {
    console.error('Verify OTP Error:', err.message);
    res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
};

/**
 * Register user without password (phone OTP based)
 */
export const registerUser = async (req, res) => {
  const { full_name, email, phone_number, age, city } = req.body;

  if (!phone_number || !full_name) {
    return res.status(400).json({
      success: false,
      message: 'Full Name and Phone Number are required',
    });
  }

  const cleanPhone = cleanPhoneNumber(phone_number);
  const userEmail = email && email.trim() ? email.trim() : `${cleanPhone}@brokmate.app`;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if phone already registered
    const phoneExists = await client.query(
      'SELECT id FROM users WHERE phone_number = $1',
      [cleanPhone]
    );
    if (phoneExists.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'An account with this mobile number already exists. Please login with OTP.',
      });
    }

    const newUserResult = await client.query(
      `INSERT INTO users (full_name, email, phone_number, age, city, role, auth_provider) 
       VALUES ($1, $2, $3, $4, $5, 'broker', 'otp') 
       RETURNING id, full_name, email, phone_number, role, age, city`,
      [full_name, userEmail, cleanPhone, age ? parseInt(age) : null, city || '']
    );

    const newUser = newUserResult.rows[0];

    // Add 7-day trial subscription
    await client.query(
      `INSERT INTO subscriptions (broker_id, plan_name, status, valid_until) 
       VALUES ($1, 'trial', 'active', NOW() + INTERVAL '7 days')`,
      [newUser.id]
    );

    await client.query('COMMIT');

    const token = generateToken(newUser.id, newUser.role || 'broker');

    res.status(201).json({
      success: true,
      id: newUser.id,
      name: newUser.full_name,
      full_name: newUser.full_name,
      email: newUser.email,
      phone_number: newUser.phone_number,
      role: newUser.role,
      token,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Register Error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error during registration' });
  } finally {
    client.release();
  }
};

/**
 * Login endpoint - initiates OTP send or accepts email/password fallback
 */
export const loginUser = async (req, res) => {
  const { phone_number, email } = req.body;

  if (phone_number) {
    req.body.phone_number = phone_number;
    return sendOtp(req, res);
  }

  if (email) {
    const cleanPhone = cleanPhoneNumber(email);
    if (cleanPhone.length === 10) {
      req.body.phone_number = cleanPhone;
      return sendOtp(req, res);
    }
  }

  return res.status(400).json({
    success: false,
    message: 'Please provide a valid 10-digit mobile number to login with OTP',
  });
};

/**
 * Delete account
 */
export const deleteAccount = async (req, res) => {
  const brokerId = req.user.id;
  try {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [brokerId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found or already deleted' });
    }
    res.status(200).json({
      success: true,
      message: 'Account and all associated data have been permanently deleted.',
    });
  } catch (err) {
    console.error('Delete Account Error:', err.message);
    res.status(500).json({ success: false, message: 'Server Error during account deletion' });
  }
};