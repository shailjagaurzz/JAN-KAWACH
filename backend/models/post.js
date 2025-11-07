const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String }, // Made optional
    content: { type: String }, // Made optional since image posts might not need content
    category: { 
        type: String, 
        enum: ['general', 'scam-alert', 'security-tip', 'experience', 'question'],
        default: 'general'
    },
    anonymous: { type: Boolean, default: false },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    imageUrl: { type: String }, // URL to uploaded image
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isVisible: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Index for better query performance
postSchema.index({ createdAt: -1 });
postSchema.index({ category: 1 });
postSchema.index({ author: 1 });

module.exports = mongoose.model('Post', postSchema);
