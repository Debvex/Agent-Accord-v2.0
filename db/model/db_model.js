const mongoose = require('mongoose');

/**
 * History Schema for storing title, description, and PDF file metadata/content.
 */
const historySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    pdfFile: {
      fileName: {
        type: String,
        required: [true, 'File name is required'],
        trim: true,
      },
      filePath: {
        type: String,
        trim: true,
        default: '',
      },
      fileUrl: {
        type: String,
        trim: true,
        default: '',
      },
      fileData: {
        type: Buffer, // Binary PDF buffer (if storing file directly in MongoDB)
      },
      contentType: {
        type: String,
        default: 'application/pdf',
      },
      fileSize: {
        type: Number, // File size in bytes
      },
    },
  },
  {
    timestamps: true, // Automatically creates and updates `createdAt` and `updatedAt` fields
  }
);

// Index for performance when querying recent history items
historySchema.index({ createdAt: -1 });

const History = mongoose.model('History', historySchema, 'histories');

module.exports = History;
