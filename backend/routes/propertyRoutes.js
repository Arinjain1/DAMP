import express from 'express';
import { createProperty, getProperties, updateProperty, getPropertyDetails } from '../controllers/propertyController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken); 
router.get('/', getProperties);
router.post('/', createProperty); 
router.put('/:id', updateProperty);
router.get('/:id', getPropertyDetails);

export default router;