import express from 'express';
import { routeRequest, getRouteHistory, getRouteById } from '../controllers/routeController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Public route (can be used without authentication)
router.post('/', routeRequest);

// Protected routes (require authentication)
router.get('/history', protect, getRouteHistory);
router.get('/:id', protect, getRouteById);

export default router;