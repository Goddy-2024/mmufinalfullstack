import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxlength: [100, 'Event name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  time: {
    type: String,
    required: [true, 'Event time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Event type is required'],
    enum: ['Service', 'Study', 'Conference', 'Meeting', 'Outreach', 'Social', 'Training']
  },
  expectedAttendees: {
    type: Number,
    min: [1, 'Expected attendees must be at least 1'],
    max: [1000, 'Expected attendees cannot exceed 1000']
  },
  actualAttendees: {
    type: Number,
    min: [0, 'Actual attendees cannot be negative'],
    default: 0
  },
  status: {
    type: String,
    enum: ['Planning', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Planning'
  },
  attendees: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    },
    checkedIn: {
      type: Boolean,
      default: false
    },
    checkedInAt: Date
  }],
  budget: {
    allocated: {
      type: Number,
      min: [0, 'Budget cannot be negative'],
      default: 0
    },
    spent: {
      type: Number,
      min: [0, 'Spent amount cannot be negative'],
      default: 0
    }
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Index for search and date queries
eventSchema.index({ name: 'text', location: 'text', type: 'text' });
eventSchema.index({ date: 1 });
eventSchema.index({ status: 1 });

export default mongoose.model('Event', eventSchema);