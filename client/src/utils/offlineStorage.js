/**
 * Offline Storage Utility
 * Provides IndexedDB-based caching for chats and documents
 * to enable offline functionality on mobile devices.
 */

const DB_NAME = 'ailifeos-offline';
const DB_VERSION = 1;

const STORES = {
  CHATS: 'chats',
  DOCUMENTS: 'documents',
  USER_PREFS: 'user_prefs',
};

/**
 * Open or create the IndexedDB database.
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORES.CHATS)) {
        db.createObjectStore(STORES.CHATS, { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains(STORES.DOCUMENTS)) {
        db.createObjectStore(STORES.DOCUMENTS, { keyPath: '_id' });
      }
      if (!db.objectStoreNames.contains(STORES.USER_PREFS)) {
        db.createObjectStore(STORES.USER_PREFS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Generic put (insert or update) into a store.
 */
async function put(storeName, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.put(data);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get a single item by key from a store.
 */
async function get(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all items from a store.
 */
async function getAll(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete a single item by key.
 */
async function remove(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Clear all items in a store.
 */
async function clearStore(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Exported API organized by domain
export const offlineChats = {
  save: (chat) => put(STORES.CHATS, chat),
  get: (id) => get(STORES.CHATS, id),
  getAll: () => getAll(STORES.CHATS),
  remove: (id) => remove(STORES.CHATS, id),
  clear: () => clearStore(STORES.CHATS),
};

export const offlineDocuments = {
  save: (doc) => put(STORES.DOCUMENTS, doc),
  get: (id) => get(STORES.DOCUMENTS, id),
  getAll: () => getAll(STORES.DOCUMENTS),
  remove: (id) => remove(STORES.DOCUMENTS, id),
  clear: () => clearStore(STORES.DOCUMENTS),
};

export const offlinePrefs = {
  save: (key, value) => put(STORES.USER_PREFS, { key, value }),
  get: async (key) => {
    const result = await get(STORES.USER_PREFS, key);
    return result ? result.value : null;
  },
  remove: (key) => remove(STORES.USER_PREFS, key),
  clear: () => clearStore(STORES.USER_PREFS),
};
