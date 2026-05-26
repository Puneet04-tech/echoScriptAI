const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const TranscriptionController = require('../controllers/transcriptionController');

// router.use(auth); // Auth applied per route

const transcriptionController = new TranscriptionController();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'audio-' + uniqueSuffix + ext);
  }
});

// File filter to accept only audio files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/wave',
    'audio/ogg',
    'audio/webm',
    'audio/mp4',
    'audio/x-m4a',
    'audio/aac'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Route to handle single file upload
router.post('/', upload.single('audio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Route to handle multiple file uploads
router.post('/multiple', upload.array('audios', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    }));

    res.json({
      message: 'Files uploaded successfully',
      files: files,
      count: files.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading files' });
  }
});

// Route to transcribe uploaded audio file
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const provider = req.body.provider || null;
    const languageCode = req.body.language || 'en-US';

    const transcription = await transcriptionController.transcribeAndSave(
      req.file,
      provider,
      languageCode
    );

    res.json({
      message: 'Transcription completed',
      transcription: transcription
    });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ message: 'Error transcribing file', error: error.message });
  }
});

// Route to get transcription by ID
router.get('/transcription/:id', async (req, res) => {
  try {
    const transcription = await transcriptionController.getTranscriptionById(req.params.id);
    
    if (!transcription) {
      return res.status(404).json({ message: 'Transcription not found' });
    }

    res.json(transcription);
  } catch (error) {
    console.error('Get transcription error:', error);
    res.status(500).json({ message: 'Error retrieving transcription' });
  }
});

// Route to get all transcriptions
router.get('/transcriptions', async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) {
      filters.status = req.query.status;
    }
    if (req.query.language) {
      filters.language = req.query.language;
    }

    const transcriptions = await transcriptionController.getAllTranscriptions(filters);
    res.json(transcriptions);
  } catch (error) {
    console.error('Get transcriptions error:', error);
    res.status(500).json({ message: 'Error retrieving transcriptions' });
  }
});

// Route to delete transcription
router.delete('/transcription/:id', async (req, res) => {
  try {
    const transcription = await transcriptionController.deleteTranscription(req.params.id);
    res.json({ message: 'Transcription deleted', transcription });
  } catch (error) {
    console.error('Delete transcription error:', error);
    res.status(500).json({ message: 'Error deleting transcription' });
  }
});

// Route to update transcription text
router.put('/transcription/:id', async (req, res) => {
  try {
    const { transcription, status, provider } = req.body;
    const updated = await transcriptionController.updateTranscription(req.params.id, {
      transcription,
      status: status || 'completed',
      provider: provider || 'browser'
    });
    res.json(updated);
  } catch (error) {
    console.error('Update transcription error:', error);
    res.status(500).json({ message: 'Error updating transcription' });
  }
});

// Route to get provider status
router.get('/provider-status', (req, res) => {
  try {
    const status = transcriptionController.getProviderStatus();
    res.json(status);
  } catch (error) {
    console.error('Get provider status error:', error);
    res.status(500).json({ message: 'Error retrieving provider status' });
  }
});

// AI Text Utility Routes

// Generate executive summary
router.post('/ai/summary', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const summary = await transcriptionController.generateSummary(text);
    res.json({ summary });
  } catch (error) {
    console.error('Generate summary error:', error);
    res.status(500).json({ message: 'Error generating summary', error: error.message });
  }
});

// Extract action items
router.post('/ai/action-items', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const actionItems = await transcriptionController.extractActionItems(text);
    res.json({ actionItems });
  } catch (error) {
    console.error('Extract action items error:', error);
    res.status(500).json({ message: 'Error extracting action items', error: error.message });
  }
});

// Remove filler words
router.post('/ai/remove-fillers', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const cleanedText = await transcriptionController.removeFillerWords(text);
    res.json({ cleanedText });
  } catch (error) {
    console.error('Remove filler words error:', error);
    res.status(500).json({ message: 'Error removing filler words', error: error.message });
  }
});

// Generate analytics
router.post('/ai/analytics', async (req, res) => {
  try {
    const { text, duration } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const analytics = await transcriptionController.generateAnalytics(text, duration);
    res.json({ analytics });
  } catch (error) {
    console.error('Generate analytics error:', error);
    res.status(500).json({ message: 'Error generating analytics', error: error.message });
  }
});

module.exports = router;
