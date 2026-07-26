const History = require('../model/db_model');

/**
 * @desc    Create and save a new history record
 * @route   POST /api/history
 * @access  Public
 */
const createHistory = async (req, res) => {
  try {
    const { title, description, fileName, filePath, fileUrl, fileData } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    let bufferData = req.file?.buffer;
    if (!bufferData && fileData) {
      if (typeof fileData === 'string') {
        const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
        bufferData = Buffer.from(base64Data, 'base64');
      } else if (Buffer.isBuffer(fileData)) {
        bufferData = fileData;
      }
    }

    const pdfFile = {
      fileName: req.file?.originalname || fileName || `${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`,
      filePath: req.file?.path || filePath || '',
      fileUrl: fileUrl || '',
      fileData: bufferData || undefined,
      contentType: req.file?.mimetype || 'application/pdf',
      fileSize: req.file?.size || (bufferData ? bufferData.length : undefined),
    };

    if (!pdfFile.fileName && !pdfFile.filePath && !pdfFile.fileUrl && !pdfFile.fileData) {
      return res.status(400).json({
        success: false,
        message: 'PDF file details or file upload is required',
      });
    }

    const historyRecord = await History.create({
      title,
      description: description || '',
      pdfFile,
    });

    console.log('Successfully saved history record to MongoDB:', historyRecord._id);

    return res.status(201).json({
      success: true,
      message: 'History record created successfully',
      data: historyRecord,
    });
  } catch (error) {
    console.error('Error creating history record:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while saving history record',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all history records
 * @route   GET /api/history
 * @access  Public
 */
const getAllHistory = async (req, res) => {
  try {
    const historyList = await History.find()
      .select('-pdfFile.fileData') // Exclude heavy binary buffer from full list query
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: historyList.length,
      data: historyList,
    });
  } catch (error) {
    console.error('Error fetching history records:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching history records',
      error: error.message,
    });
  }
};

/**
 * @desc    Get a single history record by ID
 * @route   GET /api/history/:id
 * @access  Public
 */
const getHistoryById = async (req, res) => {
  try {
    const historyItem = await History.findById(req.params.id);

    if (!historyItem) {
      return res.status(404).json({
        success: false,
        message: 'History record not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: historyItem,
    });
  } catch (error) {
    console.error('Error fetching history record by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching history record',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a history record by ID
 * @route   DELETE /api/history/:id
 * @access  Public
 */
const deleteHistory = async (req, res) => {
  try {
    const historyItem = await History.findByIdAndDelete(req.params.id);

    if (!historyItem) {
      return res.status(404).json({
        success: false,
        message: 'History record not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'History record deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('Error deleting history record:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting history record',
      error: error.message,
    });
  }
};

module.exports = {
  createHistory,
  getAllHistory,
  getHistoryById,
  deleteHistory,
};
