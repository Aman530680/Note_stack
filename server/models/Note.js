const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },

  // Content type: pdf | image | video | markdown
  type: { type: String, enum: ['pdf', 'image', 'video', 'markdown'], default: 'pdf' },

  // File URL for pdf/image
  fileUrl: { type: String, default: '' },

  // YouTube video URL for video type
  videoUrl: { type: String, default: '' },

  // Raw markdown content for markdown type
  markdownContent: { type: String, default: '' },

  // AI-generated summary
  summary: { type: String, default: '' },

  // AI-extracted tags/keywords
  tags: [{ type: String }],

  // Extracted text from PDF (used for AI chat)
  extractedText: { type: String, default: '' },

  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  downloads: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  rankScore: { type: Number, default: 0 }
}, { timestamps: true });

// Index for tag-based search
noteSchema.index({ tags: 1 });
noteSchema.index({ subject: 1 });

module.exports = mongoose.model('Note', noteSchema);
