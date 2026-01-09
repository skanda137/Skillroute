import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const generateToken = (id: number): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, language } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      email,
      password,
      name,
      language: language || 'en'
    });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.user.id);

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
};

export const logout = async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};