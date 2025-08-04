import express from 'express';
import Member from '../models/Member.js';
import Event from '../models/Event.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get department distribution
router.get('/department-distribution', authenticate, async (req, res) => {
  try {
    const departmentData = await Member.aggregate([
      {
        $match: { status: 'Active' }
      },
      {
        $group: {
          _id: '$department',
          members: { $sum: 1 }
        }
      },
      {
        $sort: { members: -1 }
      }
    ]);

    const formattedData = departmentData.map(item => ({
      department: item._id,
      members: item.members
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Department distribution error:', error);
    res.status(500).json({
      message: 'Error fetching department distribution',
      error: error.message
    });
  }
});

// Get monthly summary
router.get('/monthly-summary', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalEvents, totalAttendance] = await Promise.all([
      Event.countDocuments({
        date: { $gte: startOfMonth, $lte: now }
      }),
      Event.aggregate([
        {
          $match: {
            status: 'Completed',
            date: { $gte: startOfMonth, $lte: now }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$actualAttendees' }
          }
        }
      ])
    ]);

    const attendance = totalAttendance.length > 0 ? totalAttendance[0].total : 0;
    const averagePerEvent = totalEvents > 0 ? Math.round(attendance / totalEvents) : 0;

    res.json({
      totalEvents,
      totalAttendance: attendance,
      averagePerEvent
    });
  } catch (error) {
    console.error('Monthly summary error:', error);
    res.status(500).json({
      message: 'Error fetching monthly summary',
      error: error.message
    });
  }
});

// Get top events
router.get('/top-events', authenticate, async (req, res) => {
  try {
    const topEvents = await Event.aggregate([
      {
        $match: { status: 'Completed' }
      },
      {
        $group: {
          _id: '$name',
          avgAttendance: { $avg: '$actualAttendees' },
          eventCount: { $sum: 1 }
        }
      },
      {
        $sort: { avgAttendance: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const formattedData = topEvents.map(event => ({
      name: event._id,
      avgAttendance: `${Math.round(event.avgAttendance)} avg`
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Top events error:', error);
    res.status(500).json({
      message: 'Error fetching top events',
      error: error.message
    });
  }
});

// Get growth metrics
router.get('/growth-metrics', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      thisMonthMembers,
      lastMonthMembers,
      thisMonthAttendance,
      lastMonthAttendance,
      thisMonthEvents,
      lastMonthEvents
    ] = await Promise.all([
      Member.countDocuments({
        status: 'Active',
        createdAt: { $lte: now }
      }),
      Member.countDocuments({
        status: 'Active',
        createdAt: { $lte: endOfLastMonth }
      }),
      Event.aggregate([
        {
          $match: {
            status: 'Completed',
            date: { $gte: startOfThisMonth, $lte: now }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$actualAttendees' }
          }
        }
      ]),
      Event.aggregate([
        {
          $match: {
            status: 'Completed',
            date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$actualAttendees' }
          }
        }
      ]),
      Event.countDocuments({
        date: { $gte: startOfThisMonth, $lte: now }
      }),
      Event.countDocuments({
        date: { $gte: startOfLastMonth, $lte: endOfLastMonth }
      })
    ]);

    // Calculate growth percentagesqz 
    const memberGrowth = lastMonthMembers > 0 
      ? ((thisMonthMembers - lastMonthMembers) / lastMonthMembers * 100).toFixed(1)
      : '0.0';

    const thisMonthAtt = thisMonthAttendance.length > 0 ? thisMonthAttendance[0].total : 0;
    const lastMonthAtt = lastMonthAttendance.length > 0 ? lastMonthAttendance[0].total : 0;
    
    const attendanceGrowth = lastMonthAtt > 0 
      ? ((thisMonthAtt - lastMonthAtt) / lastMonthAtt * 100).toFixed(1)
      : '0.0';

    // Calculate event frequency (events per week)
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const weeksInMonth = daysInMonth / 7;
    const eventFrequency = (thisMonthEvents / weeksInMonth).toFixed(1);

    res.json({
      memberGrowth: `${memberGrowth > 0 ? '+' : ''}${memberGrowth}%`,
      attendanceGrowth: `${attendanceGrowth > 0 ? '+' : ''}${attendanceGrowth}%`,
      eventFrequency: `${eventFrequency}/week`
    });
  } catch (error) {
    console.error('Growth metrics error:', error);
    res.status(500).json({
      message: 'Error fetching growth metrics',
      error: error.message
    });
  }
});

export default router;