import { getEcoActions } from "./ecoActionService";
import { getEcoChallenges } from "./ecoChallengeService";

const CACHE_KEY_PREFIX = "eko_content_cache_v1_";
const TTL = 24 * 60 * 60 * 1000; // 24 hours

const memoryCache = {
  ecoActions: null,
  ecoChallenges: null,
};

function readLocal(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function writeLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // ignore
  }
}

export async function getCachedEcoActions() {
  // memory cache
  if (memoryCache.ecoActions && Date.now() - memoryCache.ecoActions.ts < TTL) {
    return memoryCache.ecoActions.data;
  }

  // localStorage cache
  const local = readLocal(CACHE_KEY_PREFIX + "ecoActions");
  if (local && Date.now() - local.ts < TTL) {
    memoryCache.ecoActions = local;
    return local.data;
  }

  try {
    const data = await getEcoActions();
    const payload = { data, ts: Date.now() };
    memoryCache.ecoActions = payload;
    writeLocal(CACHE_KEY_PREFIX + "ecoActions", payload);
    return data;
  } catch (err) {
    console.error("getCachedEcoActions error:", err);
    return [];
  }
}

export async function getCachedEcoChallenges() {
  if (
    memoryCache.ecoChallenges &&
    Date.now() - memoryCache.ecoChallenges.ts < TTL
  ) {
    return memoryCache.ecoChallenges.data;
  }

  const local = readLocal(CACHE_KEY_PREFIX + "ecoChallenges");
  if (local && Date.now() - local.ts < TTL) {
    memoryCache.ecoChallenges = local;
    return local.data;
  }

  try {
    const data = await getEcoChallenges();
    const payload = { data, ts: Date.now() };
    memoryCache.ecoChallenges = payload;
    writeLocal(CACHE_KEY_PREFIX + "ecoChallenges", payload);
    return data;
  } catch (err) {
    console.error("getCachedEcoChallenges error:", err);
    return [];
  }
}

export function invalidateCachedEcoActions() {
  memoryCache.ecoActions = null;
  try {
    localStorage.removeItem(CACHE_KEY_PREFIX + "ecoActions");
  } catch (e) {
    // ignore
  }
}

export function invalidateCachedEcoChallenges() {
  memoryCache.ecoChallenges = null;
  try {
    localStorage.removeItem(CACHE_KEY_PREFIX + "ecoChallenges");
  } catch (e) {
    // ignore
  }
}
