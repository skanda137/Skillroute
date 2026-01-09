import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import SkillRoute from '../models/SkillRoute';
import Skill from '../models/Skill';
import { classifyIntent } from '../services/intentClassifier';
import { invokeSkill } from '../services/skillRegistry';

export const routeRequest = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const requestId = req.body.request_id || uuidv4();

  try {
    const { input, context } = req.body;
    const userId = req.user?.id || null;

    if (!input) {
      return res.status(400).json({
        success: false,
        message: 'Input is required'
      });
    }

    // Step 1: Classify intent and select skill
    const { skillId, confidence, skillName } = await classifyIntent(input, context);

    if (!skillId) {
      return res.status(400).json({
        success: false,
        message: 'Could not determine appropriate skill for this request'
      });
    }

    // Step 2: Get skill details
    const skill = await Skill.findByPk(skillId);

    if (!skill || !skill.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Selected skill not found or inactive'
      });
    }

    // Step 3: Invoke the skill
    let responseData;
    let status = 'success';
    let errorMessage = null;

    try {
      responseData = await invokeSkill(skill, { input, context });
    } catch (error: any) {
      status = 'failed';
      errorMessage = error.message;
      responseData = null;
    }

    const executionTime = Date.now() - startTime;

    // Step 4: Save route to database
    const skillRoute = await SkillRoute.create({
      userId,
      requestId,
      inputText: input,
      context: context || {},
      selectedSkillId: skillId,
      confidenceScore: confidence,
      responseData,
      status,
      executionTimeMs: executionTime,
      errorMessage,
      metadata: {
        skillName,
        userAgent: req.headers['user-agent']
      }
    });

    // Step 5: Return response
    res.status(status === 'success' ? 200 : 500).json({
      success: status === 'success',
      requestId,
      data: {
        route: {
          skill: skillName,
          confidence,
          response: responseData
        },
        executionTimeMs: executionTime
      },
      error: errorMessage
    });
  } catch (error: any) {
    const executionTime = Date.now() - startTime;

    // Log failed route
    try {
      await SkillRoute.create({
        userId: req.user?.id || null,
        requestId,
        inputText: req.body.input || '',
        context: req.body.context || {},
        selectedSkillId: null,
        confidenceScore: null,
        responseData: null,
        status: 'failed',
        executionTimeMs: executionTime,
        errorMessage: error.message,
        metadata: {}
      });
    } catch (dbError) {
      console.error('Failed to log error to database:', dbError);
    }

    res.status(500).json({
      success: false,
      message: 'Error processing route request',
      error: error.message,
      requestId
    });
  }
};

export const getRouteHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const { rows: routes, count } = await SkillRoute.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Skill,
          as: 'skill',
          attributes: ['id', 'name', 'type', 'description']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset
    });

    res.status(200).json({
      success: true,
      data: {
        routes,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(count / Number(limit))
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching route history',
      error: error.message
    });
  }
};

export const getRouteById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const route = await SkillRoute.findOne({
      where: { requestId: id },
      include: [
        {
          model: Skill,
          as: 'skill',
          attributes: ['id', 'name', 'type', 'description']
        }
      ]
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    // Check if user has access
    if (route.userId && route.userId !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    res.status(200).json({
      success: true,
      data: route
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching route',
      error: error.message
    });
  }
};