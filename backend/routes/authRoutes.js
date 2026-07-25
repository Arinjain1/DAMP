import express from 'express';
import { registerUser, loginUser, deleteAccount } from '../controllers/authController.js';
import { registerValidation, loginValidation } from '../middleware/validateRequest.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.delete('/delete-account', verifyToken, deleteAccount);
export default router;