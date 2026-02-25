// src/utils/logoUrlCache.js
import { clubsApi } from "../api/clubs";

/**
 * cache: logo_key -> Promise<string|null> OR string|null
 */
const cache = new Map();

export async function getLogoUrlCached(logoKey) {
  if (!logoKey) return null;

  if (cache.has(logoKey)) {
    const v = cache.get(logoKey);
    return v instanceof Promise ? await v : v;
  }

  const p = clubsApi
    .getPublicMediaUrl(logoKey)
    .then((url) => {
      cache.set(logoKey, url);
      return url;
    })
    .catch((e) => {
      cache.delete(logoKey);
      throw e;
    });

  cache.set(logoKey, p);
  return await p;
}

/**
 * Если ты обновил лого клуба — можно сбросить для конкретного ключа.
 */
export function invalidateLogoCache(logoKey) {
  if (!logoKey) return;
  cache.delete(logoKey);
}