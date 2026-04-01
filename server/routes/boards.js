const express = require('express');
const Board = require('../models/Board');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all boards for user
router.get('/', auth, async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [{ owner: req.user.id }, { 'collaborators.user': req.user.id }],
    }).populate('owner', 'name email').sort('-updatedAt');
    res.json(boards);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create board
router.post('/', auth, async (req, res) => {
  try {
    const board = await Board.create({ ...req.body, owner: req.user.id });
    res.status(201).json(board);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single board
router.get('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id).populate('owner', 'name email').populate('collaborators.user', 'name email');
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const isOwner = board.owner._id.toString() === req.user.id;
    const collab = board.collaborators.find(c => c.user._id.toString() === req.user.id);
    if (!isOwner && !collab && !board.isPublic) return res.status(403).json({ message: 'Access denied' });

    res.json({ ...board.toObject(), role: isOwner ? 'owner' : collab?.role || 'viewer' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update board
router.put('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const isOwner = board.owner.toString() === req.user.id;
    const collab = board.collaborators.find(c => c.user.toString() === req.user.id);
    if (!isOwner && collab?.role !== 'editor') return res.status(403).json({ message: 'Access denied' });

    // Save version before update
    if (req.body.elements && board.elements.length > 0) {
      board.versions.push({ elements: board.elements, savedBy: req.user.id });
      if (board.versions.length > 20) board.versions.shift();
    }

    // Sanitize elements: remove undefined/null groupId, fix fill
    if (req.body.elements) {
      req.body.elements = req.body.elements.map((el) => {
        const clean = { ...el };
        if (!clean.groupId) delete clean.groupId;
        if (!clean.fill || clean.fill === 'transparent') clean.fill = 'transparent';
        return clean;
      });
    }

    const { elements, title, background, gridEnabled, isPublic } = req.body;
    if (elements !== undefined) board.elements = elements;
    if (title !== undefined) board.title = title;
    if (background !== undefined) board.background = background;
    if (gridEnabled !== undefined) board.gridEnabled = gridEnabled;
    if (isPublic !== undefined) board.isPublic = isPublic;

    await board.save();
    res.json(board);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete board
router.delete('/:id', auth, async (req, res) => {
  try {
    const board = await Board.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!board) return res.status(404).json({ message: 'Board not found' });
    res.json({ message: 'Board deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add collaborator
router.post('/:id/collaborators', auth, async (req, res) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, owner: req.user.id });
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const User = require('../models/User');
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const exists = board.collaborators.find(c => c.user.toString() === user._id.toString());
    if (!exists) board.collaborators.push({ user: user._id, role: req.body.role || 'viewer' });
    await board.save();
    res.json(board);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get version history
router.get('/:id/versions', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id).select('versions owner');
    if (!board) return res.status(404).json({ message: 'Board not found' });
    if (board.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Access denied' });
    res.json(board.versions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
