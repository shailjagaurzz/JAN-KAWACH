const mongoose = require('mongoose');

const reportedEntitySchema = new mongoose.Schema({
  value: { type: String, required: true, unique: true },  // email, phone, or URL
  type: { type: String, required: true, enum: ['email', 'phone', 'url'] },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  usersWatching: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // users who want SMS alerts
  reason: { type: String, required: true }, // why it's blacklisted
  threatLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  reportCount: { type: Number, default: 1 }, // how many users reported this
  isActive: { type: Boolean, default: true }, // can be disabled by admin
  lastReportedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Index for quick lookups when checking messages
reportedEntitySchema.index({ value: 1, isActive: 1 });

module.exports = mongoose.model('ReportedEntity', reportedEntitySchema);
