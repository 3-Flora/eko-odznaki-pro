import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

const CACHE_KEY_PREFIX = "eko_names_cache_v1_";
const TTL = 24 * 60 * 60 * 1000; // 24 hours

const memoryCache = {
  schools: {},
  classes: {},
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

export async function getSchoolName(id) {
  if (!id) return "";

  const mem = memoryCache.schools[id];
  if (mem && Date.now() - mem.ts < TTL) return mem.name;

  const local = readLocal(CACHE_KEY_PREFIX + "school_" + id);
  if (local && Date.now() - local.ts < TTL) {
    memoryCache.schools[id] = local;
    return local.name;
  }

  try {
    const sRef = doc(db, "schools", id);
    const sSnap = await getDoc(sRef);
    if (sSnap.exists()) {
      const data = sSnap.data();
      const name = data.name || data.title || "";
      const payload = { name, ts: Date.now() };
      memoryCache.schools[id] = payload;
      writeLocal(CACHE_KEY_PREFIX + "school_" + id, payload);
      return name;
    }
  } catch (err) {
    console.error("getSchoolName error:", err);
  }

  return "";
}

export async function getClassName(id) {
  if (!id) return "";

  const mem = memoryCache.classes[id];
  if (mem && Date.now() - mem.ts < TTL) return mem.name;

  const local = readLocal(CACHE_KEY_PREFIX + "class_" + id);
  if (local && Date.now() - local.ts < TTL) {
    memoryCache.classes[id] = local;
    return local.name;
  }

  try {
    const cRef = doc(db, "classes", id);
    const cSnap = await getDoc(cRef);
    if (cSnap.exists()) {
      const data = cSnap.data();
      const name = data.name || data.title || "";
      const payload = { name, ts: Date.now() };
      memoryCache.classes[id] = payload;
      writeLocal(CACHE_KEY_PREFIX + "class_" + id, payload);
      return name;
    }
  } catch (err) {
    console.error("getClassName error:", err);
  }

  return "";
}

// Funkcje do preload cache przy logowaniu
export async function preloadSchoolName(id) {
  if (!id) return "";

  // Sprawdź czy już mamy w cache
  const mem = memoryCache.schools[id];
  if (mem && Date.now() - mem.ts < TTL) return mem.name;

  const local = readLocal(CACHE_KEY_PREFIX + "school_" + id);
  if (local && Date.now() - local.ts < TTL) {
    memoryCache.schools[id] = local;
    return local.name;
  }

  // Pobierz z bazy i zapisz w cache
  try {
    const sRef = doc(db, "schools", id);
    const sSnap = await getDoc(sRef);
    if (sSnap.exists()) {
      const data = sSnap.data();
      const name = data.name || data.title || "";
      const payload = { name, ts: Date.now() };
      memoryCache.schools[id] = payload;
      writeLocal(CACHE_KEY_PREFIX + "school_" + id, payload);
      return name;
    }
  } catch (err) {
    console.error("preloadSchoolName error:", err);
  }

  return "";
}

export async function preloadClassName(id) {
  if (!id) return "";

  // Sprawdź czy już mamy w cache
  const mem = memoryCache.classes[id];
  if (mem && Date.now() - mem.ts < TTL) return mem.name;

  const local = readLocal(CACHE_KEY_PREFIX + "class_" + id);
  if (local && Date.now() - local.ts < TTL) {
    memoryCache.classes[id] = local;
    return local.name;
  }

  // Pobierz z bazy i zapisz w cache
  try {
    const cRef = doc(db, "classes", id);
    const cSnap = await getDoc(cRef);
    if (cSnap.exists()) {
      const data = cSnap.data();
      const name = data.name || data.title || "";
      const payload = { name, ts: Date.now() };
      memoryCache.classes[id] = payload;
      writeLocal(CACHE_KEY_PREFIX + "class_" + id, payload);
      return name;
    }
  } catch (err) {
    console.error("preloadClassName error:", err);
  }

  return "";
}

// Funkcje do odczytu z cache (synchroniczne)
export function getCachedSchoolName(id) {
  if (!id) return "";

  const mem = memoryCache.schools[id];
  if (mem && Date.now() - mem.ts < TTL) return mem.name;

  const local = readLocal(CACHE_KEY_PREFIX + "school_" + id);
  if (local && Date.now() - local.ts < TTL) {
    memoryCache.schools[id] = local;
    return local.name;
  }

  return "";
}

export function getCachedClassName(id) {
  if (!id) return "";

  const mem = memoryCache.classes[id];
  if (mem && Date.now() - mem.ts < TTL) return mem.name;

  const local = readLocal(CACHE_KEY_PREFIX + "class_" + id);
  if (local && Date.now() - local.ts < TTL) {
    memoryCache.classes[id] = local;
    return local.name;
  }

  return "";
}
