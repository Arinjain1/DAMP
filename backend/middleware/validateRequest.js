import { body, validationResult } from 'express-validator';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0]?.msg || 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

export const registerValidation = [
  body('full_name').notEmpty().trim().withMessage('Full Name is required'),
  body('phone_number').notEmpty().trim().withMessage('Phone number is required'),
  validate,
];

export const loginValidation = [
  body('phone_number').optional().trim(),
  body('email').optional().trim(),
  validate,
];

export const otpValidation = [
  body('phone_number').notEmpty().trim().withMessage('Phone number is required'),
  body('otp').notEmpty().trim().withMessage('OTP code is required'),
  body('verification_token').notEmpty().withMessage('Verification token is required'),
  validate,
];