import express from 'express';
import mongoose from 'mongoose';
import Member from '../models/Member.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all members with pagination and search
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      department = '',
      status = ''
    } = req.query;

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Return mock data if database is not connected
      const mockMembers = [
        {
          _id: '1',
          name: 'Godswill Omondi Ajuoga',
          email: 'gaoajuoga@gmail.com',
          phone: '+254740275539',
          department: 'IT & Video',
          joinDate: '2024-08-28',
          status: 'Active'
        },
        {
          _id: '2',
          name: 'William Ndiema',
          email: 'william.ndiema@gmail.com',
          phone: '+254700000000',
          department: 'Worship',
          joinDate: '2023-08-28',
          status: 'Active'
        }
      ];

      return res.json({
        members: mockMembers,
        pagination: {
          current: parseInt(page),
          pages: 1,
          total: mockMembers.length,
          limit: parseInt(limit)
        }
      });
    }

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) {
      query.department = department;
    }
    
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [members, total] = await Promise.all([
      Member.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Member.countDocuments(query)
    ]);

    res.json({
      members,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({
      message: 'Error fetching members',
      error: error.message
    });
  }
});

// Get single member
router.get('/:id', authenticate, async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json(member);
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({
      message: 'Error fetching member',
      error: error.message
    });
  }
});

// Create new member
router.post('/', authenticate, authorize('admin', 'moderator'), async (req, res) => {
  try {
    const member = new Member(req.body);
    await member.save();

    res.status(201).json({
      message: 'Member created successfully',
      member
    });
  } catch (error) {
    console.error('Create member error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Member with this email already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      message: 'Error creating member',
      error: error.message
    });
  }
});

// Update member
router.put('/:id', authenticate, authorize('admin', 'moderator'), async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({
      message: 'Member updated successfully',
      member
    });
  } catch (error) {
    console.error('Update member error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Member with this email already exists'
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      message: 'Error updating member',
      error: error.message
    });
  }
});

// Delete member
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({
      message: 'Error deleting member',
      error: error.message
    });
  }
});

// Get member statistics
router.get('/stats/overview', authenticate, async (req, res) => {
  try {
    const [
      totalMembers,
      activeMembers,
      departmentStats,
      recentMembers
    ] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ status: 'Active' }),
      Member.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Member.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    res.json({
      totalMembers,
      activeMembers,
      recentMembers,
      departmentStats
    });
  } catch (error) {
    console.error('Member stats error:', error);
    res.status(500).json({
      message: 'Error fetching member statistics',
      error: error.message
    });
  }
});

export default router;