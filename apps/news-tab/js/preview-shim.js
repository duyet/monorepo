/** Preview chrome.* when this folder is opened as files, not as an extension. */

function memoryArea(prefix) {
  const readAll = () => {
    try {
      return JSON.parse(localStorage.getItem(prefix) || "{}");
    } catch {
      return {};
    }
  };

  return {
    get(keys) {
      const store = readAll();
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
      const store = { ...readAll(), ...items };
      localStorage.setItem(prefix, JSON.stringify(store));
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

installPreviewShim();
