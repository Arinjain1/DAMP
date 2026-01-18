import express from 'express';
import { createProperty, getProperties } from '../controllers/propertyController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken); 
router.get('/', getProperties);
router.post('/', createProperty); 

export default router;