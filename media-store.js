(function () {
  const DB_NAME = "iamyotto_media_db";
  const STORE_NAME = "media_files";
  const DB_VERSION = 1;

  let dbPromise = null;

  function createId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function inferMediaTypeFromMime(mime) {
    const safe = String(mime || "").toLowerCase();
    return safe.startsWith("video/") ? "video" : "image";
  }

  function openDb() {
    if (dbPromise) {
      return dbPromise;
    }

    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(new Error("IndexedDB indisponible"));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          dbPromise = null;
        };
        resolve(db);
      };

      request.onerror = () => {
        reject(request.error || new Error("Impossible d'ouvrir IndexedDB"));
      };
    }).catch((error) => {
      dbPromise = null;
      throw error;
    });

    return dbPromise;
  }

  async function withStore(mode, callback) {
    const db = await openDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, mode);
      const store = transaction.objectStore(STORE_NAME);

      let callbackResult;
      try {
        callbackResult = callback(store);
      } catch (error) {
        reject(error);
        return;
      }

      transaction.oncomplete = () => resolve(callbackResult);
      transaction.onerror = () => reject(transaction.error || new Error("Transaction IndexedDB échouée"));
      transaction.onabort = () => reject(transaction.error || new Error("Transaction IndexedDB annulée"));
    });
  }

  function toMediaRef(record) {
    return {
      storage: "idb",
      id: record.id,
      type: record.type,
      name: record.name,
      size: record.size,
    };
  }

  async function saveBlob(blob, meta = {}) {
    if (!(blob instanceof Blob)) {
      throw new Error("Blob invalide");
    }

    const id = createId();
    const type = meta.type === "video" || meta.type === "image"
      ? meta.type
      : inferMediaTypeFromMime(blob.type);

    const record = {
      id,
      blob,
      type,
      name: String(meta.name || "media"),
      size: Number(blob.size || 0),
      createdAt: new Date().toISOString(),
    };

    await withStore("readwrite", (store) => {
      store.put(record);
    });

    return toMediaRef(record);
  }

  async function saveFile(file) {
    if (!(file instanceof File)) {
      throw new Error("Fichier invalide");
    }

    const explicitType = String(file.type || "").startsWith("video/") ? "video" : "image";
    return saveBlob(file, {
      type: explicitType,
      name: file.name || "media",
    });
  }

  async function getBlobById(id) {
    const key = String(id || "").trim();
    if (!key) {
      return null;
    }

    return withStore("readonly", (store) => {
      return new Promise((resolve, reject) => {
        const request = store.get(key);
        request.onsuccess = () => {
          const record = request.result;
          resolve(record?.blob instanceof Blob ? record.blob : null);
        };
        request.onerror = () => reject(request.error || new Error("Lecture média impossible"));
      });
    });
  }

  async function getObjectURLById(id) {
    const blob = await getBlobById(id);
    if (!blob) {
      return "";
    }

    return URL.createObjectURL(blob);
  }

  async function deleteById(id) {
    const key = String(id || "").trim();
    if (!key) {
      return false;
    }

    await withStore("readwrite", (store) => {
      store.delete(key);
    });

    return true;
  }

  window.IamyottoMediaStore = {
    saveBlob,
    saveFile,
    getBlobById,
    getObjectURLById,
    deleteById,
  };
})();
