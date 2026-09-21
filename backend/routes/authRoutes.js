import express from 'express';
import {
  sendOtp,
  verifyOtp,
  registerUser,
  loginUser,
  deleteAccount,
} from '../controllers/authController.js';
import {
  registerValidation,
  loginValidation,
  otpValidation,
} from '../middleware/validateRequest.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/resend-otp', sendOtp);
router.post('/verify-otp', otpValidation, verifyOtp);
router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.delete('/delete-account', verifyToken, deleteAccount);

export default router;