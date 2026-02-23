import express from 'express';
import { createSiteVisit, getVisitDetails, submitVisitFeedback, getPropertiesByOutcome } from '../controllers/visitController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(verifyToken);

router.post('/', createSiteVisit);             
router.get('/:id', getVisitDetails);            
router.put('/item/:itemId', submitVisitFeedback); 
router.get('/:id/properties', getPropertiesByOutcome);
export default router;