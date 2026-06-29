import express from 'express';
import Log from '../models/Log.js';

const router = express.Router();

/**
 * @route   GET /api/logs
 * @desc    Get all daily logs
 * @query   startDate, endDate, limit
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;

    const filter = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const logs = await Log.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

/**
 * @route   GET /api/logs/date/:date
 * @desc    Get log for a specific date
 * @access  Public
 */
router.get('/date/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);

    const log = await Log.findOne({
      date: {
        $gte: date,
        $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (!log) {
      return res.json(null);
    }

    res.json(log);
  } catch (error) {
    console.error('Error fetching log:', error);
    res.status(500).json({ error: 'Failed to fetch log' });
  }
});

/**
 * @route   GET /api/logs/stats
 * @desc    Get log statistics (mood trends, streaks)
 * @query   days (default 30)
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const moodStats = await Log.getMoodStats(parseInt(days));

    // Calculate streak (consecutive days with logs)
    const allLogs = await Log.find({ date: { $gte: startDate } })
      .sort({ date: -1 })
      .select('date');

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);

      const hasLog = allLogs.some(log => {
        const logDate = new Date(log.date);
        return logDate.toDateString() === checkDate.toDateString();
      });

      if (hasLog) {
        streak++;
      } else {
        break;
      }
    }

    res.json({
      moodDistribution: moodStats,
      streakDays: streak,
      totalLogs: await Log.countDocuments({ date: { $gte: startDate } }),
    });
  } catch (error) {
    console.error('Error fetching log stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * @route   POST /api/logs
 * @desc    Create a new daily log
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { date, accomplishments, challenges, learnings, tomorrow, mood } = req.body;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    // Check for existing log on this date
    const existing = await Log.findOne({
      date: {
        $gte: logDate,
        $lt: new Date(logDate.getTime() + 24 * 60 * 60 * 1000),
      },
    });

    if (existing) {
      return res.status(409).json({
        error: 'A log already exists for this date. Use PUT to update it.',
        existingId: existing._id,
      });
    }

    const log = new Log({
      date: logDate,
      accomplishments: accomplishments || [],
      challenges: challenges || [],
      learnings: learnings || [],
      tomorrow: tomorrow || [],
      mood: mood || 'good',
    });

    await log.save();
    res.status(201).json(log);
  } catch (error) {
    console.error('Error creating log:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'A log already exists for this date' });
    }
    res.status(500).json({ error: 'Failed to create log' });
  }
});

/**
 * @route   PUT /api/logs/:id
 * @desc    Update a daily log
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  try {
    const { accomplishments, challenges, learnings, tomorrow, mood } = req.body;

    const updateData = {};
    if (accomplishments !== undefined) updateData.accomplishments = accomplishments;
    if (challenges !== undefined) updateData.challenges = challenges;
    if (learnings !== undefined) updateData.learnings = learnings;
    if (tomorrow !== undefined) updateData.tomorrow = tomorrow;
    if (mood !== undefined) updateData.mood = mood;

    const log = await Log.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!log) {
      return res.status(404).json({ error: 'Log not found' });
    }

    res.json(log);
  } catch (error) {
    console.error('Error updating log:', error);
    res.status(500).json({ error: 'Failed to update log' });
  }
});

/**
 * @route   DELETE /api/logs/:id
 * @desc    Delete a daily log
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const log = await Log.findByIdAndDelete(req.params.id);
    if (!log) {
      return res.status(404).json({ error: 'Log not found' });
    }

    res.json({ message: 'Log deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting log:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid log ID' });
    }
    res.status(500).json({ error: 'Failed to delete log' });
  }
});

export default router;
