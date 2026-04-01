const mongoose = require('mongoose');

const elementSchema = new mongoose.Schema({
  id: String,
  type: {
    type: String,
    enum: [
      'pencil', 'eraser', 'rect', 'circle', 'arrow', 'line', 'text', 'sticky',
      'triangle', 'diamond', 'star', 'hexagon', 'parallelogram', 'cylinder',
      'image', 'highlight',
    ],
  },
  points: [Number],
  x: Number, y: Number,
  width: Number, height: Number,
  radius: Number,
  text: String,
  fontSize: { type: Number, default: 16 },
  fontStyle: { type: String, default: 'normal' },
  stroke: { type: String, default: '#000000' },
  strokeWidth: { type: Number, default: 2 },
  strokeDash: [Number],
  fill: { type: String, default: 'transparent' },
  opacity: { type: Number, default: 1 },
  rotation: { type: Number, default: 0 },
  layerIndex: { type: Number, default: 0 },
  groupId: String,
  src: String,
  sides: Number,
  cornerRadius: Number,
}, { _id: false });

const versionSchema = new mongoose.Schema({
  elements: [elementSchema],
  savedAt: { type: Date, default: Date.now },
  savedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: false });

const collaboratorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: { type: String, enum: ['editor', 'viewer'], default: 'viewer' },
}, { _id: false });

const boardSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled Board' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [collaboratorSchema],
  elements: [elementSchema],
  thumbnail: { type: String, default: '' },
  isPublic: { type: Boolean, default: false },
  versions: { type: [versionSchema], default: [] },
  background: { type: String, default: '#ffffff' },
  gridEnabled: { type: Boolean, default: false },
  inviteToken: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Board', boardSchema);
