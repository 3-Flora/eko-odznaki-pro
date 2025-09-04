import { getEcoActions } from "./ecoActionService";
import { getEcoChallenges } from "./ecoChallengeService";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

const CACHE_KEY_PREFIX = "eko_content_cache_v1_";
const TTL = 24 * 60 * 60 * 1000; // 24 hours

const memoryCache = {
  ecoActions: null,
  ecoChallenges: null,
  schools: null,
  submissions: {}, // map userId -> { data, ts }
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
    console.error("writeLocal error:", e);
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
    console.error("invalidateCachedEcoActions error:", e);
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

export async function getCachedSchools() {
  // memory cache
  if (memoryCache.schools && Date.now() - memoryCache.schools.ts < TTL) {
    return memoryCache.schools.data;
  }

  // localStorage cache
  const local = readLocal(CACHE_KEY_PREFIX + "schools");
  if (local && Date.now() - local.ts < TTL) {
    memoryCache.schools = local;
    return local.data;
  }

  try {
    // Fetch schools, classes and users to compute counts and attach them to each school
    const [schoolsSnapshot, classesSnapshot, usersSnapshot] = await Promise.all(
      [
        getDocs(collection(db, "schools")),
        getDocs(collection(db, "classes")),
        getDocs(collection(db, "users")),
      ],
    );

    const classCountBySchool = new Map();
    for (const cls of classesSnapshot.docs) {
      const sid = cls.data().schoolId;
      if (!sid) continue;
      classCountBySchool.set(sid, (classCountBySchool.get(sid) || 0) + 1);
    }

    const studentCountBySchool = new Map();
    for (const user of usersSnapshot.docs) {
      const data = user.data();
      if (data.role !== "student") continue;
      const sid = data.schoolId;
      if (!sid) continue;
      studentCountBySchool.set(sid, (studentCountBySchool.get(sid) || 0) + 1);
    }

    const data = schoolsSnapshot.docs.map((d) => {
      const base = { id: d.id, ...d.data() };
      return {
        ...base,
        classCount: classCountBySchool.get(d.id) || 0,
        studentCount: studentCountBySchool.get(d.id) || 0,
      };
    });

    const payload = { data, ts: Date.now() };
    memoryCache.schools = payload;
    writeLocal(CACHE_KEY_PREFIX + "schools", payload);
    return data;
  } catch (err) {
    console.error("getCachedSchools error:", err);
    return [];
  }
}

export function invalidateCachedSchools() {
  memoryCache.schools = null;
  try {
    localStorage.removeItem(CACHE_KEY_PREFIX + "schools");
  } catch (e) {
    console.error("invalidateCachedSchools error:", e);
  }
}

// --- User submissions cache (per-user) ---
export async function getCachedUserSubmissions(userId) {
  if (!userId) return [];

  // memory cache
  const mem = memoryCache.submissions && memoryCache.submissions[userId];
  if (mem && Date.now() - mem.ts < TTL) {
    return mem.data;
  }

  // localStorage cache
  const local = readLocal(CACHE_KEY_PREFIX + `submissions_${userId}`);
  if (local && Date.now() - local.ts < TTL) {
    memoryCache.submissions = memoryCache.submissions || {};
    memoryCache.submissions[userId] = local;
    return local.data;
  }

  try {
    // Fetch submissions for the given user
    const submissionsQuery = query(
      collection(db, "submissions"),
      where("studentId", "==", userId),
    );

    const querySnapshot = await getDocs(submissionsQuery);
    const submissions = querySnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    // Sort newest first
    submissions.sort((a, b) => {
      const dateA = a.createdAt?.toDate
        ? a.createdAt.toDate()
        : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate
        ? b.createdAt.toDate()
        : new Date(b.createdAt);
      return dateB - dateA;
    });

    const payload = { data: submissions, ts: Date.now() };
    memoryCache.submissions = memoryCache.submissions || {};
    memoryCache.submissions[userId] = payload;
    writeLocal(CACHE_KEY_PREFIX + `submissions_${userId}`, payload);
    return submissions;
  } catch (err) {
    console.error("getCachedUserSubmissions error:", err);
    return [];
  }
}

export function invalidateCachedUserSubmissions(userId) {
  try {
    if (memoryCache.submissions && memoryCache.submissions[userId]) {
      delete memoryCache.submissions[userId];
    }
    localStorage.removeItem(CACHE_KEY_PREFIX + `submissions_${userId}`);
  } catch (e) {
    console.error("invalidateCachedUserSubmissions error:", e);
  }
}
