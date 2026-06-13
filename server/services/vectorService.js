const { generateEmbedding } = require('./llm/geminiProvider');

/**
 * Calculates cosine similarity between two vectors.
 * Returns a score between -1 and 1 (1 is identical).
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Splits text into overlapping chunks for embedding.
 */
const chunkText = (text, maxTokens = 500, overlapTokens = 100) => {
  // Very simplistic chunking by words (assuming ~1.3 words per token)
  const words = text.split(/\s+/);
  const chunks = [];
  const chunkSize = Math.floor(maxTokens * 0.75); // approx words
  const overlap = Math.floor(overlapTokens * 0.75);

  let i = 0;
  while (i < words.length) {
    const chunkWords = words.slice(i, i + chunkSize);
    chunks.push(chunkWords.join(' '));
    i += (chunkSize - overlap);
  }
  return chunks;
};

/**
 * Search an array of chunks (which contain .embedding) against a query string.
 */
const semanticSearch = async (query, chunks, topK = 3) => {
  try {
    const queryEmbedding = await generateEmbedding(query);
    
    // Score each chunk
    const scoredChunks = chunks.map(chunk => ({
      ...chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding)
    }));

    // Sort by score descending and take topK
    scoredChunks.sort((a, b) => b.score - a.score);
    return scoredChunks.slice(0, topK);
  } catch (err) {
    console.error('[VectorService] Semantic search error:', err);
    return [];
  }
};

module.exports = {
  cosineSimilarity,
  chunkText,
  semanticSearch,
  generateEmbedding
};
