// @ts-nocheck
export const isTauri = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

let store;

// HTTP Fetch abstraction
export async function httpFetch(url, options = {}) {
    if (isTauri) {
        const { fetch } = await import('@tauri-apps/plugin-http');
        return await fetch(url, options);
    } else {
        const res = await fetch(url, options);
        return {
            json: async () => await res.json()
        };
    }
}

// Initialize store (Tauri only)
export async function initStore() {
    if (isTauri && !store) {
        const { LazyStore } = await import('@tauri-apps/plugin-store');
        store = new LazyStore('.data.dat');
    }
}

export async function copyToClipboard(text) {
  if (isTauri) {
    const { writeText } = await import("@tauri-apps/plugin-clipboard-manager");
    await writeText(text);
  } else {
    await navigator.clipboard.writeText(text);
  }
}

// Load favorites from Tauri or localStorage
export async function loadFavorites() {
    if (isTauri) {
        await initStore();
        const favs = await store.get('favorites');
        return new Set(favs || []);
    } else {
        const raw = localStorage.getItem('favorites');
        return new Set(raw ? JSON.parse(raw) : []);
    }
}

// Save favorites to Tauri or localStorage
export async function saveFavorites(favorites) {
    const favArray = Array.from(favorites);
    if (isTauri) {
        await store.set('favorites', favArray);
        await store.save();
    } else {
        localStorage.setItem('favorites', JSON.stringify(favArray));
    }
}
