import express from 'express';
import Session from '../models/Session.js';
import Project from '../models/Project.js';

const router = express.Router();

/**
 * @route   GET /api/sessions
 * @desc    Get all sessions with optional filters
 * @query   projectId, startDate, endDate, limit
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { projectId, startDate, endDate, limit = 100 } = req.query;

    const filter = {};

    if (projectId) {
      filter.projectId = projectId;
    }

    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate);
      if (endDate) filter.startTime.$lte = new Date(endDate);
    }

    const sessions = await Session.find(filter)
      .sort({ startTime: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

/**
 * @route   GET /api/sessions/stats
 * @desc    Get session statistics
 * @query   projectId, days (default 7)
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    const { projectId, days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const match = {
      startTime: { $gte: startDate },
      endTime: { $ne: null },
    };

    if (projectId) {
      match.projectId = projectId;
    }

    // Daily breakdown
    const dailyStats = await Session.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$startTime' },
          },
          totalSeconds: { $sum: '$duration' },
          sessionCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Project breakdown
    const projectStats = await Session.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$projectId',
          projectName: { $first: '$projectName' },
          totalSeconds: { $sum: '$duration' },
          sessionCount: { $sum: 1 },
        },
      },
      { $sort: { totalSeconds: -1 } },
    ]);

    // Overall stats
    const overallStats = await Session.aggregate([
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

    const overall = overallStats[0] || { totalSeconds: 0, sessionCount: 0, avgDuration: 0 };

    res.json({
      daily: dailyStats.map(d => ({
        date: d._id,
        hours: Math.round((d.totalSeconds / 3600) * 10) / 10,
        sessions: d.sessionCount,
      })),
      byProject: projectStats.map(p => ({
        projectId: p._id,
        projectName: p.projectName,
        hours: Math.round((p.totalSeconds / 3600) * 10) / 10,
        sessions: p.sessionCount,
      })),
      total: {
        hours: Math.round((overall.totalSeconds / 3600) * 10) / 10,
        sessions: overall.sessionCount,
        avgSessionHours: Math.round((overall.avgDuration / 3600) * 10) / 10,
      },
    });
  } catch (error) {
    console.error('Error fetching session stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * @route   GET /api/sessions/active
 * @desc    Get currently active session (if any)
 * @access  Public
 */
router.get('/active', async (req, res) => {
  try {
    const activeSession = await Session.findOne({ endTime: null })
      .sort({ startTime: -1 })
      .lean();

    if (!activeSession) {
      return res.json(null);
    }

    // Calculate current duration
    const currentDuration = Math.floor((Date.now() - new Date(activeSession.startTime).getTime()) / 1000);

    res.json({
      ...activeSession,
      currentDuration,
    });
  } catch (error) {
    console.error('Error fetching active session:', error);
    res.status(500).json({ error: 'Failed to fetch active session' });
  }
});

/**
 * @route   POST /api/sessions
 * @desc    Create a new time session (start tracking)
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { projectId, description, tags } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check for existing active session
    const activeSession = await Session.findOne({ endTime: null });
    if (activeSession) {
      return res.status(409).json({
        error: 'An active session already exists. Stop it before starting a new one.',
        activeSession,
      });
    }

    const session = new Session({
      projectId,
      projectName: project.name,
      description: description?.trim() || '',
      tags: tags || [],
      startTime: new Date(),
      duration: 0,
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    res.status(500).json({ error: 'Failed to create session' });
  }
});

/**
 * @route   PUT /api/sessions/:id/stop
 * @desc    Stop a time session
 * @access  Public
 */
router.put('/:id/stop', async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.endTime) {
      return res.status(400).json({ error: 'Session already stopped' });
    }

    const endTime = new Date();
    const duration = Math.floor((endTime - session.startTime) / 1000);

    session.endTime = endTime;
    session.duration = duration;
    await session.save();

    res.json({
      ...session.toObject(),
      durationHours: Math.round((duration / 3600) * 100) / 100,
    });
  } catch (error) {
    console.error('Error stopping session:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid session ID' });
    }
    res.status(500).json({ error: 'Failed to stop session' });
  }
});

/**
 * @route   PUT /api/sessions/:id
 * @desc    Update a session (edit details)
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  try {
    const { description, tags } = req.body;

    const updateData = {};
    if (description !== undefined) updateData.description = description.trim();
    if (tags !== undefined) updateData.tags = tags;

    const session = await Session.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

/**
 * @route   DELETE /api/sessions/:id
 * @desc    Delete a session
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ message: 'Session deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting session:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid session ID' });
    }
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

export default router;
