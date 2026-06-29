import express from 'express';
import Project from '../models/Project.js';
import Session from '../models/Session.js';

const router = express.Router();

/**
 * @route   GET /api/projects
 * @desc    Get all projects
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find()
      .sort({ createdAt: -1 })
      .lean();

    // Get session count and total hours for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const stats = await Session.aggregate([
          {
            $match: {
              projectId: project._id,
              endTime: { $ne: null },
            },
          },
          {
            $group: {
              _id: null,
              totalSeconds: { $sum: '$duration' },
              sessionCount: { $sum: 1 },
            },
          },
        ]);

        const stat = stats[0] || { totalSeconds: 0, sessionCount: 0 };
        return {
          ...project,
          totalHours: Math.round((stat.totalSeconds / 3600) * 10) / 10,
          sessionCount: stat.sessionCount,
        };
      })
    );

    res.json(projectsWithStats);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).lean();
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get recent sessions for this project
    const sessions = await Session.find({ projectId: project._id })
      .sort({ startTime: -1 })
      .limit(10)
      .lean();

    res.json({ ...project, recentSessions: sessions });
  } catch (error) {
    console.error('Error fetching project:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    // Check for duplicate name
    const existing = await Project.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ error: 'Project with this name already exists' });
    }

    const project = new Project({
      name: name.trim(),
      description: description?.trim() || '',
      color: color || '#0ea5e9',
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create project' });
  }
});

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, description, color, isActive } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (color !== undefined) updateData.color = color;
    if (isActive !== undefined) updateData.isActive = isActive;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    res.status(500).json({ error: 'Failed to update project' });
  }
});

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting project:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
