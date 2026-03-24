const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true // Add index for searches
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Add index for author queries
  },
  isPublic: {
    type: Boolean,
    default: false,
    index: true // Add index for public/private filtering
  },
  tags: {
    type: [String],
    index: true // Add index for tag searches
  },
  category: {
    type: String,
    default: 'General',
    index: true // Add index for category filtering
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
noteSchema.index({ isPublic: 1, createdAt: -1 });
noteSchema.index({ author: 1, createdAt: -1 });
noteSchema.index({ category: 1, isPublic: 1 });

module.exports = mongoose.model('Note', noteSchema);