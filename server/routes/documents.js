const express = require('express');
const multer = require('multer');
const path = require('path');
const os = require('os');
const {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  askQuestion
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// Multer config — store to OS temp dir, apply file type + size filters
const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/png', 'image/jpeg', 'image/jpg',
      'text/plain', 'application/pdf'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: PDF, TXT, PNG, JPG.`));
    }
  }
});

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);
router.post('/:id/ask', askQuestion);

module.exports = router;
