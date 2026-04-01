const mongoose = require('mongoose');

const elementSchema = new mongoose.Schema({
  id: String,
  type: { type: String, enum: ['pencil', 'rect', 'circle', 'arrow', 'line', 'text', 'sticky'] },
  points: [Number],
  x: Number, y: Number,
  width: Number, height: Number,
  radius: Number,
  text: String,
  fontSize: { type: Number, default: 16 },
  stroke: { type: String, default: '#000000' },
  strokeWidth: { type: Number, default: 2 },
  fill: { type: String, default: 'transparent' },
  opacity: { type: Number, default: 1 },
  rotation: { type: Number, default: 0 },
  layerIndex: { type: Number, default: 0 },
  groupId: String,
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
}, { timestamps: true });

module.exports = mongoose.model('Board', boardSchema);
