// models/vault.js
const mongoose = require('mongoose');

const vaultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileHash: { type: String, required: true, unique: true }, // SHA-256 hash of the file
  mimeType: { type: String, required: true },
  
  // Blockchain specific fields
  blockchainHash: { type: String, required: true }, // Hash of the blockchain block
  blockIndex: { type: Number, required: true }, // Position in the blockchain
  evidenceId: { type: String, required: true, unique: true }, // Unique evidence identifier
  
  // Metadata
  uploadedAt: { type: Date, default: Date.now },
  verified: { type: Boolean, default: true },
  integrityChecks: [{
    checkedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['verified', 'corrupted'], default: 'verified' },
    details: String
  }],
  
  // Evidence metadata
  evidenceType: { 
    type: String, 
    enum: ['document', 'image', 'video', 'audio', 'other'],
    default: 'document'
  },
  tags: [String],
  description: String,
  associatedCase: String, // Link to complaint or case
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for efficient queries
vaultSchema.index({ user: 1, createdAt: -1 });
vaultSchema.index({ fileHash: 1 });
vaultSchema.index({ evidenceId: 1 });
vaultSchema.index({ blockIndex: 1 });

// Pre-save middleware to update updatedAt
vaultSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Vault', vaultSchema);
