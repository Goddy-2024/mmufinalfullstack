import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Register new user (admin only in production)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'admin' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email or username'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Error registering user',
      error: error.message
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required'
      });
    }

    // For development, use hardcoded credentials
    const validCredentials = {
      username: 'admin',
      password: 'rhsf2024',
      email: 'admin@rhsf.com',
      role: 'admin'
    };

    if (username === validCredentials.username && password === validCredentials.password) {
      // Generate JWT token
      const token = jwt.sign(
        { userId: 'admin-user-id', role: validCredentials.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: 'admin-user-id',
          username: validCredentials.username,
          email: validCredentials.email,
          role: validCredentials.role
        }
      });
    } else {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Error during login',
      error: error.message
    });
  }
});

// Get current user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    // For development, return mock user data
    const mockUser = {
      id: 'admin-user-id',
      username: 'admin',
      email: 'admin@rhsf.com',
      role: 'admin'
    };
    
    res.json({
      user: mockUser
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logout successful' });
});

export default router;