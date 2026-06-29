import mongoose from 'mongoose';

/**
 * Project Schema
 * Represents a development project for time tracking
 */
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Project name cannot exceed 100 characters'],
    index: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: '',
  },
  color: {
    type: String,
    default: '#0ea5e9',
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: 'Color must be a valid hex color code',
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for total hours tracked
projectSchema.virtual('totalHours', {
  ref: 'Session',
  localField: '_id',
  foreignField: 'projectId',
  justOne: false,
  count: false,
  options: { match: { endTime: { $ne: null } } },
});

// Index for efficient queries
projectSchema.index({ createdAt: -1 });

// Pre-remove middleware to handle cascading deletes
projectSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  // Sessions will keep projectId for historical data
  // but you could delete them here if needed
  next();
});

export default mongoose.model('Project', projectSchema);
