const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Add index for faster queries
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  image: {
    type: String,
    default: ''
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    index: true // Add index for tag searches
  },
  category: {
    type: String,
    default: 'General',
    index: true // Add index for category filtering
  }
}, {
  timestamps: true
});

// Compound index for common queries
postSchema.index({ createdAt: -1, category: 1 });
postSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);