const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');
const groqProvider = require('./llm/groqProvider');
const { transcribeAudio } = require('./audioService');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}


// Supported MIME types
const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const SUPPORTED_TEXT_TYPES  = ['text/plain'];
const SUPPORTED_PDF_TYPES   = ['application/pdf'];
const SUPPORTED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a', 'video/mp4', 'audio/webm'];

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

  // ── Images — Tesseract OCR + Gemini Vision Fallback ──────────────────────────────────
  if (SUPPORTED_IMAGE_TYPES.includes(mimetype)) {
    try {
      const worker = await Tesseract.createWorker('eng');
      const ret = await worker.recognize(filePath);
      await worker.terminate();
      
      const ocrText = ret.data.text.trim();
      if (ocrText && ocrText.length > 5) {
        return ocrText;
      }
      throw new Error("OCR returned little or no text");
    } catch (error) {
      console.warn("Tesseract OCR failed or returned little text, falling back to Gemini Vision:", error.message);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = "Analyze this image in deep detail. Extract all text exactly as written (in its original language). Then, provide a deep research summary of what this image contains, its context, and any relevant facts.";
      const imagePart = fileToGenerativePart(filePath, mimetype);
      
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      return response.text().trim();
    }
  }

  // ── PDF — pdf-parse with Gemini Vision Fallback ──────────────────
  if (SUPPORTED_PDF_TYPES.includes(mimetype)) {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      const text = data.text.trim();
      
      if (!text || text.length < 5) {
        throw new Error("pdf-parse returned no text, likely a scanned PDF.");
      }
      return text;
    } catch (error) {
      console.warn("pdf-parse failed, falling back to Gemini Vision:", error.message);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = "Extract ALL text from this PDF document exactly as written, preserving the original structure, headings, and formatting as much as possible. If the PDF contains images or diagrams, describe them briefly. Return only the extracted content.";
      const pdfPart = fileToGenerativePart(filePath, 'application/pdf');
      
      const result = await model.generateContent([prompt, pdfPart]);
      const response = await result.response;
      const text = response.text().trim();
      
      if (!text || text.length < 5) {
        throw new Error("Could not extract text from this PDF. The document might be empty or corrupted.");
      }
      return text;
    }
  }

  // ── Audio/Video — Whisper Transcription ──────────────────────────
  if (SUPPORTED_AUDIO_TYPES.includes(mimetype)) {
    const text = await transcribeAudio(filePath, file.originalname);
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
    const summary = await groqProvider.generateResponse(prompt, systemInstruction);
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
    const answer = await groqProvider.generateResponse(prompt, systemInstruction);
    return answer.trim();
  } catch (err) {
    console.error('[DocumentService] askDocumentQuestion error:', err.message);
    return 'Could not retrieve an answer at this time.';
  }
};

module.exports = { processDocument, summarizeDocument, askDocumentQuestion };
