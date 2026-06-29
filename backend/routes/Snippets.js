import express from 'express';
import Snippet from '../models/Snippet.js';

const router = express.Router();

/**
 * @route   GET /api/snippets
 * @desc    Get all snippets with optional search and filters
 * @query   q (search), language, tags, isFavorite, limit, skip
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { q, language, tags, isFavorite, limit = 50, skip = 0 } = req.query;

    const filter = {};

    if (q) {
      filter.$text = { $search: q };
    }

    if (language) {
      filter.language = language;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $all: tagArray };
    }

    if (isFavorite !== undefined) {
      filter.isFavorite = isFavorite === 'true';
    }

    const snippets = await Snippet.find(filter)
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();

    res.json(snippets);
  } catch (error) {
    console.error('Error fetching snippets:', error);
    res.status(500).json({ error: 'Failed to fetch snippets' });
  }
});

/**
 * @route   GET /api/snippets/tags
 * @desc    Get all unique tags with counts
 * @access  Public
 */
router.get('/tags', async (req, res) => {
  try {
    const tags = await Snippet.getAllTags();
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

/**
 * @route   GET /api/snippets/stats
 * @desc    Get snippet statistics
 * @access  Public
 */
router.get('/stats', async (req, res) => {
  try {
    const [languageStats, total, favorites] = await Promise.all([
      Snippet.getLanguageStats(),
      Snippet.countDocuments(),
      Snippet.countDocuments({ isFavorite: true }),
    ]);

    res.json({
      byLanguage: languageStats,
      total,
      favorites,
    });
  } catch (error) {
    console.error('Error fetching snippet stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * @route   GET /api/snippets/:id
 * @desc    Get single snippet by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const snippet = await Snippet.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    res.json(snippet);
  } catch (error) {
    console.error('Error fetching snippet:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid snippet ID' });
    }
    res.status(500).json({ error: 'Failed to fetch snippet' });
  }
});

/**
 * @route   POST /api/snippets
 * @desc    Create a new snippet
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, code, language, tags, projectId, projectName, isFavorite } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const snippet = new Snippet({
      title: title.trim(),
      description: description?.trim() || '',
      code,
      language: language || 'JavaScript',
      tags: tags || [],
      projectId: projectId || null,
      projectName: projectName || '',
      isFavorite: isFavorite || false,
    });

    await snippet.save();
    res.status(201).json(snippet);
  } catch (error) {
    console.error('Error creating snippet:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create snippet' });
  }
});

/**
 * @route   PUT /api/snippets/:id
 * @desc    Update a snippet
 * @access  Public
 */
router.put('/:id', async (req, res) => {
  try {
    const { title, description, code, language, tags, projectId, projectName, isFavorite } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (code !== undefined) updateData.code = code;
    if (language !== undefined) updateData.language = language;
    if (tags !== undefined) updateData.tags = tags;
    if (projectId !== undefined) updateData.projectId = projectId;
    if (projectName !== undefined) updateData.projectName = projectName;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

    const snippet = await Snippet.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    res.json(snippet);
  } catch (error) {
    console.error('Error updating snippet:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid snippet ID' });
    }
    res.status(500).json({ error: 'Failed to update snippet' });
  }
});

/**
 * @route   PUT /api/snippets/:id/favorite
 * @desc    Toggle favorite status
 * @access  Public
 */
router.put('/:id/favorite', async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    snippet.isFavorite = !snippet.isFavorite;
    await snippet.save();

    res.json(snippet);
  } catch (error) {
    console.error('Error toggling favorite:', error);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

/**
 * @route   DELETE /api/snippets/:id
 * @desc    Delete a snippet
 * @access  Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const snippet = await Snippet.findByIdAndDelete(req.params.id);
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    res.json({ message: 'Snippet deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting snippet:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid snippet ID' });
    }
    res.status(500).json({ error: 'Failed to delete snippet' });
  }
});

export default router;
