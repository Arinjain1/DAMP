import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const getJwtSecret = () => process.env.JWT_SECRET || 'my_private_jwt_secret_key';

/**
 * Clean phone number to standard 10-digit Indian mobile number
 */
export const cleanPhoneNumber = (phone) => {
  if (!phone) return '';
  const digits = phone.toString().replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.substring(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.substring(1);
  }
  return digits.slice(-10);
};

/**
 * Send OTP via Fast2SMS using DLT message code (template ID) 222397
 */
export const sendOtpViaFast2Sms = async (phoneNumber, otp) => {
  const cleanPhone = cleanPhoneNumber(phoneNumber);
  const apiKey = process.env.FAST2SMS_API_KEY;
  const senderId = process.env.SENDER_ID || 'SQFT';
  const messageCode = process.env.FAST2SMS_MESSAGE_CODE || '222397';

  if (!cleanPhone || cleanPhone.length !== 10) {
    throw new Error('Please enter a valid 10-digit mobile number');
  }

  console.log(`[Fast2SMS] Sending OTP ${otp} to ${cleanPhone} (Sender: ${senderId}, Code: ${messageCode})...`);

  const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      'authorization': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route: 'dlt',
      sender_id: senderId,
      message: messageCode,
      variables_values: otp.toString(),
      flash: 0,
      numbers: cleanPhone,
    }),
  });

  const data = await response.json();
  console.log('[Fast2SMS] Response received:', data);

  if (!data || data.return === false) {
    const errorMsg = Array.isArray(data?.message)
      ? data.message.join(', ')
      : (data?.message || 'Failed to send SMS via Fast2SMS');
    throw new Error(errorMsg);
  }

  return data;
};

/**
 * Generate a 4-digit OTP and sign a stateless verification JWT token (no database needed)
 */
export const generateOtpToken = (phoneNumber) => {
  const cleanPhone = cleanPhoneNumber(phoneNumber);
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const secret = getJwtSecret();

  const hash = crypto
    .createHmac('sha256', secret)
    .update(`${cleanPhone}.${otp}`)
    .digest('hex');

  const verificationToken = jwt.sign(
    { phone_number: cleanPhone, hash },
    secret,
    { expiresIn: '5m' }
  );

  return { otp, cleanPhone, verificationToken };
};

/**
 * Verify submitted OTP against stateless verification JWT token
 */
export const verifyOtpToken = (phoneNumber, otp, verificationToken) => {
  const cleanPhone = cleanPhoneNumber(phoneNumber);
  const secret = getJwtSecret();
  try {
    const decoded = jwt.verify(verificationToken, secret);
    if (decoded.phone_number !== cleanPhone) {
      return { valid: false, message: 'Phone number mismatch' };
    }

    const expectedHash = crypto
      .createHmac('sha256', secret)
      .update(`${cleanPhone}.${otp.toString().trim()}`)
      .digest('hex');

    if (decoded.hash !== expectedHash) {
      return { valid: false, message: 'Invalid OTP. Please enter the correct code.' };
    }

    return { valid: true };
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return { valid: false, message: 'OTP has expired. Please request a new one.' };
    }
    return { valid: false, message: 'Invalid or expired OTP session. Please request a new OTP.' };
  }
};

