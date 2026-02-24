import express from 'express';
import { createProperty, getProperties, updateProperty, getPropertyDetails } from '../controllers/propertyController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { requireActiveSubscription } from '../middleware/subscriptionMiddleware.js';
const router = express.Router();

router.use(verifyToken); 
router.get('/',requireActiveSubscription, getProperties);
router.post('/',requireActiveSubscription, createProperty); 
router.put('/:id',requireActiveSubscription, updateProperty);
router.get('/:id',requireActiveSubscription, getPropertyDetails);

export default router;