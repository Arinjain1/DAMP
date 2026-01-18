import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { registerValidation, loginValidation } from '../middleware/validateRequest.js';

const router = express.Router();
router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);

export default router;