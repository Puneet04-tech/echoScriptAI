const mongoose = require('mongoose');

const transcriptionSchema = new mongoose.Schema({
  // User who owns this transcription
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Audio file information
  audioFile: {
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    }
  },

  // Transcription details
  transcription: {
    type: String,
    default: ''
  },

  // Transcription status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },

  // Language detection
  language: {
    type: String,
    default: 'en'
  },

  // STT provider used
  provider: {
    type: String,
    enum: ['whisper', 'deepgram', 'browser'],
    default: 'whisper'
  },

  // Audio duration in seconds
  duration: {
    type: Number,
    default: 0
  },

  // Error message if transcription failed
  error: {
    type: String,
    default: ''
  },

  // Flag to indicate if browser fallback should be used
  useBrowserFallback: {
    type: Boolean,
    default: false
  },

  // Processing metadata
  processingTime: {
    type: Number,
    default: 0
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
transcriptionSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Create indexes for better query performance
transcriptionSchema.index({ status: 1 });
transcriptionSchema.index({ createdAt: -1 });
transcriptionSchema.index({ language: 1 });

const Transcription = mongoose.model('Transcription', transcriptionSchema);

module.exports = Transcription;
