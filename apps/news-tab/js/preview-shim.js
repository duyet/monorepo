/** Preview chrome.* when this folder is opened as files, not as an extension. */

const memoryStores = new Map();

function readStore(prefix) {
  try {
    if (typeof localStorage !== "undefined") {
      return JSON.parse(localStorage.getItem(prefix) || "{}");
    }
  } catch {
    // fall through to process memory
  }
  return { ...(memoryStores.get(prefix) || {}) };
}

function writeStore(prefix, value) {
  memoryStores.set(prefix, value);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(prefix, JSON.stringify(value));
    }
  } catch {
    // Node / private mode
  }
}

function memoryArea(prefix) {
  return {
    get(keys) {
      const store = readStore(prefix);
      let result = {};
      if (keys == null) {
        result = { ...store };
      } else if (typeof keys === "string") {
        if (keys in store) result[keys] = store[keys];
      } else if (Array.isArray(keys)) {
        for (const key of keys) {
          if (key in store) result[key] = store[key];
        }
      } else {
        result = { ...keys, ...store };
      }
      return Promise.resolve(result);
    },
    set(items) {
      writeStore(prefix, { ...readStore(prefix), ...items });
      return Promise.resolve();
    },
  };
}

export function installPreviewShim() {
  const existing = globalThis.chrome;
  if (existing?.storage?.sync?.get) return;

  globalThis.chrome = {
    storage: {
      sync: memoryArea("news-tab-sync"),
      local: memoryArea("news-tab-local"),
    },
    i18n: {
      getMessage() {
        return "";
      },
    },
    runtime: {
      lastError: undefined,
      openOptionsPage() {},
    },
    permissions: {
      contains() {
        return Promise.resolve(true);
      },
      request() {
        return Promise.resolve(true);
      },
    },
  };
}

export function resetPreviewStores() {
  memoryStores.clear();
}

installPreviewShim();
