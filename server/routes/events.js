import express from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Member from '../models/Member.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all events with pagination and filters
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      type = '',
      status = '',
      startDate = '',
      endDate = ''
    } = req.query;

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Return mock data if database is not connected
      const mockEvents = [
        {
          _id: '1',
          name: 'Morning Class Evangelism',
          description: 'Evangelism during morning classes',
          date: '2024-12-15',
          time: '09:00',
          location: 'Main Hall',
          type: 'Service',
          expectedAttendees: 150,
          actualAttendees: 142,
          status: 'Upcoming',
          organizer: { name: 'Godswill Omondi Ajuoga', email: 'gaoajuoga@gmail.com' }
        },
        {
          _id: '2',
          name: 'Weekly Fellowship',
          description: 'Weekly fellowship meeting',
          date: '2024-12-18',
          time: '19:00',
          location: 'Conference Room',
          type: 'Study',
          expectedAttendees: 80,
          actualAttendees: 0,
          status: 'Upcoming',
          organizer: { name: 'William Ndiema', email: 'william.ndiema@gmail.com' }
        }
      ];

      return res.json({
        events: mockEvents,
        pagination: {
          current: parseInt(page),
          pages: 1,
          total: mockEvents.length,
          limit: parseInt(limit)
        }
      });
    }

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (type) {
      query.type = type;
    }
    
    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [events, total] = await Promise.all([
      Event.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Event.countDocuments(query)
    ]);

    res.json({
      events,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      message: 'Error fetching events',
      error: error.message
    });
  }
});

// Get single event
router.get('/:id', authenticate, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('name phone')
      .populate('attendees.member', 'name');
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      message: 'Error fetching event',
      error: error.message
    });
  }
});

// Create new event
router.post('/', authenticate, authorize('admin', 'moderator'), async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();


    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      message: 'Error creating event',
      error: error.message
    });
  }
});

// Update event
router.put('/:id', authenticate, authorize('admin', 'moderator'), async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('name');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }

    res.status(500).json({
      message: 'Error updating event',
      error: error.message
    });
  }
});

// Delete event
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      message: 'Error deleting event',
      error: error.message
    });
  }
});

// Add attendee to event
router.post('/:id/attendees', authenticate, authorize('admin', 'moderator'), async (req, res) => {
  try {
    const { memberId } = req.body;
    
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Check if member is already registered
    const existingAttendee = event.attendees.find(
      attendee => attendee.member.toString() === memberId
    );

    if (existingAttendee) {
      return res.status(400).json({ message: 'Member already registered for this event' });
    }

    event.attendees.push({ member: memberId });
    await event.save();

    const updatedEvent = await Event.findById(event._id)
      .populate('attendees.member', 'name');

    res.json({
      message: 'Attendee added successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Add attendee error:', error);
    res.status(500).json({
      message: 'Error adding attendee',
      error: error.message
    });
  }
});

// Check in attendee
router.put('/:id/attendees/:memberId/checkin', authenticate, authorize('admin', 'moderator'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const attendee = event.attendees.find(
      att => att.member.toString() === req.params.memberId
    );

    if (!attendee) {
      return res.status(404).json({ message: 'Attendee not found' });
    }

    attendee.checkedIn = true;
    attendee.checkedInAt = new Date();
    
    // Update actual attendees count
    event.actualAttendees = event.attendees.filter(att => att.checkedIn).length;
    
    await event.save();

    res.json({
      message: 'Attendee checked in successfully',
      attendee
    });
  } catch (error) {
    console.error('Check in error:', error);
    res.status(500).json({
      message: 'Error checking in attendee',
      error: error.message
    });
  }
});

export default router;