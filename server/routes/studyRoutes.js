const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const studyService = require('../services/studyService');

// POST /api/study/:documentId/mcq
router.post('/:documentId/mcq', async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.documentId, userId: req.user.id });
    if (!doc) return res.status(404).json({ success: false, error: 'Document not found' });
    if (!doc.extractedText) return res.status(422).json({ success: false, error: 'No text extracted from document' });

    const count = req.body.count || 5;
    const mcqs = await studyService.generateMCQs(doc.extractedText, count);

    // Save quizzes to document
    doc.quizzes = mcqs;
    await doc.save();

    res.json({ success: true, data: mcqs });
  } catch (err) {
    next(err);
  }
});

// POST /api/study/:documentId/flashcards
router.post('/:documentId/flashcards', async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.documentId, userId: req.user.id });
    if (!doc) return res.status(404).json({ success: false, error: 'Document not found' });
    if (!doc.extractedText) return res.status(422).json({ success: false, error: 'No text extracted from document' });

    const count = req.body.count || 10;
    const flashcards = await studyService.generateFlashcards(doc.extractedText, count);

    res.json({ success: true, data: flashcards });
  } catch (err) {
    next(err);
  }
});

// POST /api/study/:documentId/explain
router.post('/:documentId/explain', async (req, res, next) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ success: false, error: 'Topic is required' });

    const doc = await Document.findOne({ _id: req.params.documentId, userId: req.user.id });
    if (!doc) return res.status(404).json({ success: false, error: 'Document not found' });
    if (!doc.extractedText) return res.status(422).json({ success: false, error: 'No text extracted from document' });

    const explanation = await studyService.explainTopic(doc.extractedText, topic);

    res.json({ success: true, data: explanation });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
