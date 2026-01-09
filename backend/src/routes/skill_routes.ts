import express, { Request, Response } from 'express';
import { protect, authorize } from '../middleware/auth';
import { getAllSkills, getSkillById, registerSkill, updateSkill, deactivateSkill } from '../services/skillRegistry';

const router = express.Router();

// Get all skills (public)
router.get('/', async (req: Request, res: Response) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const skills = await getAllSkills(includeInactive);
    
    res.status(200).json({
      success: true,
      count: skills.length,
      data: skills
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching skills',
      error: error.message
    });
  }
});

// Get skill by ID (public)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const skill = await getSkillById(parseInt(req.params.id));
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: skill
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching skill',
      error: error.message
    });
  }
});

// Register new skill (admin only)
router.post('/', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const skill = await registerSkill(req.body);
    
    res.status(201).json({
      success: true,
      data: skill
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error registering skill',
      error: error.message
    });
  }
});

// Update skill (admin only)
router.put('/:id', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    const skill = await updateSkill(parseInt(req.params.id), req.body);
    
    res.status(200).json({
      success: true,
      data: skill
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating skill',
      error: error.message
    });
  }
});

// Deactivate skill (admin only)
router.delete('/:id', protect, authorize('admin'), async (req: Request, res: Response) => {
  try {
    await deactivateSkill(parseInt(req.params.id));
    
    res.status(200).json({
      success: true,
      message: 'Skill deactivated successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating skill',
      error: error.message
    });
  }
});

export default router;