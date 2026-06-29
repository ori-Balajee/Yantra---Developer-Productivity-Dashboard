import mongoose from 'mongoose';

/**
 * Daily Log Schema
 * Represents a developer's daily journal/standup entry
 */
const logSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Date is required'],
    index: true,
    unique: true,
  },
  accomplishments: [{
    type: String,
    trim: true,
    maxlength: [500, 'Accomplishment cannot exceed 500 characters'],
  }],
  challenges: [{
    type: String,
    trim: true,
    maxlength: [500, 'Challenge cannot exceed 500 characters'],
  }],
  learnings: [{
    type: String,
    trim: true,
    maxlength: [500, 'Learning cannot exceed 500 characters'],
  }],
  tomorrow: [{
    type: String,
    trim: true,
    maxlength: [500, 'Goal cannot exceed 500 characters'],
  }],
  mood: {
    type: String,
    enum: {
      values: ['great', 'good', 'okay', 'struggling'],
      message: 'Mood must be one of: great, good, okay, struggling',
    },
    default: 'good',
    index: true,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    default: '',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Compound indexes
logSchema.index({ date: -1 });
logSchema.index({ mood: 1, date: -1 });

// Virtual for day of week
logSchema.virtual('dayOfWeek').get(function() {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][this.date.getDay()];
});

// Static method to get logs for a date range
logSchema.statics.getByDateRange = async function(startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ date: -1 });
};

// Static method to get mood statistics
logSchema.statics.getMoodStats = async function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: { date: { $gte: startDate } },
    },
    {
      $group: {
        _id: '$mood',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
};

export default mongoose.model('Log', logSchema);
