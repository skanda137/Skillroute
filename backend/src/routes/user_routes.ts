import express, { Request, Response } from 'express';
import { protect, authorize } from '../middleware/auth';
import User from '../models/User';

const router = express.Router();

// Get user profile
router.get('/profile', protect, async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile', protect, async (req: Request, res: Response) => {
  try {
    const { name, language, preferences } = req.body;
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (language) updates.language = language;
    if (preferences) updates.preferences = preferences;

    await user.update(updates);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// Get user by ID (admin only)
router.get('/:id', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

export default router;