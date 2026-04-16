const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  downloads: { type: Number, default: 0 },
  avgRating: { type: Number, default: 0 },
  rankScore: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
