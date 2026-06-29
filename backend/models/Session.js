import mongoose from 'mongoose';

/**
 * Time Session Schema
 * Represents a time tracking session
 */
const sessionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required'],
    index: true,
  },
  projectName: {
    type: String,
    required: [true, 'Project name is required'],
    index: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: '',
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
    default: Date.now,
    index: true,
  },
  endTime: {
    type: Date,
    default: null,
    validate: {
      validator: function(v) {
        return v === null || v > this.startTime;
      },
      message: 'End time must be after start time',
    },
  },
  duration: {
    type: Number,
    default: 0,
    min: [0, 'Duration cannot be negative'],
    // Duration in seconds
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [30, 'Tag cannot exceed 30 characters'],
  }],
  isBreak: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Compound index for efficient time-based queries
sessionSchema.index({ projectId: 1, startTime: -1 });
sessionSchema.index({ startTime: -1 });
sessionSchema.index({ tags: 1 });

// Virtual for duration in hours
sessionSchema.virtual('durationHours').get(function() {
  return Math.round((this.duration / 3600) * 100) / 100;
});

// Calculate duration before saving if endTime is set
sessionSchema.pre('save', function(next) {
  if (this.endTime && this.isModified('endTime')) {
    this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  }
  next();
});

// Static method to get weekly stats
sessionSchema.statics.getWeeklyStats = async function(projectId = null) {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const match = {
    startTime: { $gte: weekStart },
    endTime: { $ne: null },
  };

  if (projectId) {
    match.projectId = new mongoose.Types.ObjectId(projectId);
  }

  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalSeconds: { $sum: '$duration' },
        sessionCount: { $sum: 1 },
        avgDuration: { $avg: '$duration' },
      },
    },
  ]);
};

export default mongoose.model('Session', sessionSchema);
