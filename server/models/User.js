const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, default: null }, // null for OAuth users
  avatar:   { type: String, default: '' },
  provider: { type: String, default: 'local' }, // local | google | github
  providerId: { type: String, default: '' },
  bio:      { type: String, default: '' },
  createdAt:{ type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
