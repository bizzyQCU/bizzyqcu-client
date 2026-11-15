/**
 * IndexedDB helper for storing and retrieving product images.
 * Provides client-side persistence for uploaded product photos across page refreshes.
 */

const DB_NAME = "bizzyqcu_products_db";
const DB_VERSION = 1;
const STORE_NAME = "product_images";

let dbInstance = null;

/**
 * Open or create the IndexedDB database.
 */
export function openImageDB() {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "productId" });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.warn("IndexedDB open error:", event.target.error);
      resolve(null);
    };
  });
}

/**
 * Converts a File or Blob into a base64 Data URL.
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }
    // If it's already a string (data: or http/https)
    if (typeof file === "string") {
      resolve(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Saves images associated with a productId to IndexedDB.
 * @param {string} productId
 * @param {Array<{ id: string, url?: string, file?: File, name?: string, type?: string }>} images
 */
export async function saveProductImages(productId, images = []) {
  if (!productId) return;

  try {
    const serializedImages = await Promise.all(
      images.map(async (img, idx) => {
        let finalUrl = img.url || "";
        if (img.file) {
          try {
            finalUrl = await fileToDataUrl(img.file);
          } catch {
            finalUrl = img.url || "";
          }
        }
        return {
          id: img.id || `img-${idx}-${Date.now()}`,
          url: finalUrl,
          name: img.file?.name || img.name || `photo-${idx + 1}`,
          type: img.file?.type || img.type || "image/jpeg",
          isLocal: true,
        };
      })
    );

    const db = await openImageDB();
    if (!db) return;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const record = {
        productId,
        images: serializedImages,
        updatedAt: new Date().toISOString(),
      };
      const req = store.put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn("Failed to save product images to IndexedDB:", err);
  }
}

/**
 * Retrieves stored images for a productId from IndexedDB.
 * @param {string} productId
 * @returns {Promise<Array<{ id: string, url: string, name: string, type: string, isLocal: boolean }>>}
 */
export async function getProductImages(productId) {
  if (!productId) return [];

  try {
    const db = await openImageDB();
    if (!db) return [];

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(productId);

      req.onsuccess = (e) => {
        const record = e.target.result;
        resolve(record?.images || []);
      };

      req.onerror = () => resolve([]);
    });
  } catch (err) {
    console.warn("Failed to get product images from IndexedDB:", err);
    return [];
  }
}

/**
 * Deletes stored images associated with a productId from IndexedDB.
 * @param {string} productId
 */
export async function deleteProductImages(productId) {
  if (!productId) return;

  try {
    const db = await openImageDB();
    if (!db) return;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(productId);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn("Failed to delete product images from IndexedDB:", err);
  }
}

