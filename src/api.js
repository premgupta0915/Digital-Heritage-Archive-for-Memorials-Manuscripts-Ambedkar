import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

/**
 * Ask the grounded RAG chat endpoint a question. Returns the answer text
 * plus citations (volume/page) the backend retrieved it from.
 */
export async function ragChat(question) {
  const { data } = await client.post('/api/v1/rag/chat', { question });
  return data; // { answer, citations, session_id }
}

/**
 * Look up an archive_item's real backend UUID by matching on title.
 * Returns null if nothing matches.
 */
export async function findArchiveItemIdByTitle(title) {
  const { data } = await client.post('/api/search', { query: title, category: 'all' });
  const results = data.results || [];
  if (results.length === 0) return null;
  return results[0].id;
}

/**
 * Request the souvenir summary + QR payload for a real archive_item_id.
 */
export async function printSouvenirRequest(archiveItemId) {
  const { data } = await client.post('/api/v1/kiosk/print-souvenir', {
    archive_item_id: archiveItemId,
    include_qr: true,
  });
  return data; // { summary_text, qr_payload, qr_image_base64 }
}

/**
 * Fetch the audio/video media library.
 */
export async function fetchMediaLibrary() {
  const { data } = await client.get('/api/media');
  return data;
}

/**
 * Translate text into any language via the backend (Claude-powered),
 * for foreign-language support beyond BHASHINI's Indian-language scope.
 */
export async function translateText(text, targetLanguage) {
  const { data } = await client.post('/api/v1/translate', {
    text,
    target_language: targetLanguage,
  });
  return data.translated_text;
}

export default client;
