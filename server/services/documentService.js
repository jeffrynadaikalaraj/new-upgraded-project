const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const geminiProvider = require('./llm/geminiProvider');

// Supported MIME types
const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const SUPPORTED_TEXT_TYPES  = ['text/plain'];
const SUPPORTED_PDF_TYPES   = ['application/pdf'];

/**
 * Extract text from an uploaded file.
 * Supports: TXT, PNG, JPG/JPEG (OCR), PDF (text-layer extraction).
 * @param {Express.Multer.File} file
 * @returns {Promise<string>} Extracted text
 */
const processDocument = async (file) => {
  const { mimetype, path: filePath } = file;

  // ── Plain text ──────────────────────────────────────────────────
  if (SUPPORTED_TEXT_TYPES.includes(mimetype)) {
    const text = fs.readFileSync(filePath, 'utf8');
    return text.trim();
  }

  // ── Images — OCR via Tesseract ──────────────────────────────────
  if (SUPPORTED_IMAGE_TYPES.includes(mimetype)) {
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
      logger: () => {} // silence progress logs
    });
    return text.trim();
  }

  // ── PDF — attempt text-layer extraction via pdf-parse if available,
  //         otherwise fall back to OCR on first page via Tesseract ──
  if (SUPPORTED_PDF_TYPES.includes(mimetype)) {
    try {
      // Dynamically require pdf-parse (optional dep); if not installed, falls through
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      const text = pdfData.text.trim();
      if (text.length > 20) return text; // usable text found in layer
    } catch (_) {
      // pdf-parse not installed or page has no text layer → OCR fallback
    }

    // OCR fallback for scanned PDFs (treat first-page as image via Tesseract buffer)
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
      logger: () => {}
    });
    return text.trim();
  }

  throw new Error(`Unsupported file type: ${mimetype}`);
};

/**
 * Use Gemini to generate a concise summary (≤150 words) from extracted text.
 * @param {string} text
 * @returns {Promise<string>}
 */
const summarizeDocument = async (text) => {
  if (!text || text.length < 30) return 'Document appears to be empty or too short to summarize.';

  const systemInstruction = `You are a document analysis assistant for AI LifeOS.
Produce a concise, informative summary of the provided document text.
Rules:
- Maximum 150 words.
- Write in plain prose (no markdown, no bullet points).
- Capture the core purpose, key facts, and most important takeaways.
- Do not add opinions or outside knowledge.`;

  const prompt = `Summarize the following document:\n\n${text.slice(0, 12000)}`; // cap to avoid token limits

  try {
    const summary = await geminiProvider.generateResponse(prompt, systemInstruction);
    return summary.trim();
  } catch (err) {
    console.error('[DocumentService] summarizeDocument error:', err.message);
    return 'Summary could not be generated.';
  }
};

/**
 * Answer a specific question using only the document's extracted text.
 * @param {string} documentText
 * @param {string} question
 * @returns {Promise<string>}
 */
const askDocumentQuestion = async (documentText, question) => {
  const systemInstruction = `You are a precise document Q&A assistant for AI LifeOS.
Rules:
- Answer ONLY using the content from the provided document.
- If the answer is not found in the document, respond with exactly:
  "This information is not present in the uploaded document."
- Keep your answer concise and direct.
- Do not add outside knowledge or guesses.`;

  const prompt = `Document content:\n"""\n${documentText.slice(0, 12000)}\n"""\n\nUser question: ${question}`;

  try {
    const answer = await geminiProvider.generateResponse(prompt, systemInstruction);
    return answer.trim();
  } catch (err) {
    console.error('[DocumentService] askDocumentQuestion error:', err.message);
    return 'Could not retrieve an answer at this time.';
  }
};

module.exports = { processDocument, summarizeDocument, askDocumentQuestion };
