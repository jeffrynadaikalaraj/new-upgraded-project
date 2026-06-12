const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const { processDocument, summarizeDocument, askDocumentQuestion } = require('../services/documentService');

// POST /api/documents/upload
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const file = req.file;

    // 1. Extract text
    let extractedText = '';
    try {
      extractedText = await processDocument(file);
    } catch (extractErr) {
      // Clean up temp file before responding
      fs.unlink(file.path, () => {});
      return res.status(422).json({ success: false, error: extractErr.message });
    }

    // 2. Generate summary
    const summary = await summarizeDocument(extractedText);

    // 3. Auto-tag from filename
    const tags = file.originalname
      .replace(/\.[^.]+$/, '') // strip extension
      .toLowerCase()
      .split(/[\s_\-]+/)
      .filter(t => t.length > 2);

    // 4. Save document record
    const doc = await Document.create({
      userId: req.user.id,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      extractedText,
      summary,
      tags
    });

    // 5. Remove the temp upload file (we store text in DB, not file on disk)
    fs.unlink(file.path, (err) => {
      if (err) console.warn('[DocumentController] Could not delete temp file:', err.message);
    });

    res.status(201).json({ success: true, data: doc });
  } catch (err) {
    // Ensure temp file cleanup on any unexpected error
    if (req.file?.path) fs.unlink(req.file.path, () => {});
    next(err);
  }
};

// GET /api/documents
exports.getDocuments = async (req, res, next) => {
  try {
    const docs = await Document.find({ userId: req.user.id })
      .select('-extractedText') // exclude heavy text in list view
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: docs });
  } catch (err) {
    next(err);
  }
};

// GET /api/documents/:id
exports.getDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user.id });
    if (!doc) return res.status(404).json({ success: false, error: 'Document not found.' });
    res.status(200).json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/documents/:id
exports.deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!doc) return res.status(404).json({ success: false, error: 'Document not found.' });
    res.status(200).json({ success: true, message: 'Document deleted.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/documents/:id/ask
exports.askQuestion = async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question?.trim()) {
      return res.status(400).json({ success: false, error: 'A question is required.' });
    }

    const doc = await Document.findOne({ _id: req.params.id, userId: req.user.id });
    if (!doc) return res.status(404).json({ success: false, error: 'Document not found.' });

    if (!doc.extractedText) {
      return res.status(422).json({ success: false, error: 'No text extracted from this document.' });
    }

    const answer = await askDocumentQuestion(doc.extractedText, question);
    res.status(200).json({ success: true, data: { answer } });
  } catch (err) {
    next(err);
  }
};
