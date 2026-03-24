/**
 * Session Manager — IndexedDB CRUD for Focus Sessions
 * All data stays 100% on-device. No cloud. No tracking.
 */

export interface FocusSession {
  id?: number;
  startTime: number;       // Unix timestamp ms
  endTime: number;         // Unix timestamp ms
  durationMs: number;      // Actual focused milliseconds
  mood?: "great" | "okay" | "tough"; // Post-session reflection
  sessionType?: "deep" | "light" | "creative" | "study";
  notes?: string;
}

const DB_NAME = "focus-twin";
const DB_VERSION = 1;
const SESSIONS_STORE = "sessions";

let _db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
        const store = db.createObjectStore(SESSIONS_STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("startTime", "startTime", { unique: false });
      }
    };
    req.onsuccess = (e) => {
      _db = (e.target as IDBOpenDBRequest).result;
      resolve(_db);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function saveSession(session: Omit<FocusSession, "id">): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SESSIONS_STORE, "readwrite");
    const req = tx.objectStore(SESSIONS_STORE).add(session);
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllSessions(): Promise<FocusSession[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SESSIONS_STORE, "readonly");
    const req = tx.objectStore(SESSIONS_STORE).getAll();
    req.onsuccess = () => resolve(req.result as FocusSession[]);
    req.onerror = () => reject(req.error);
  });
}

export async function getSessionsInRange(
  from: number,
  to: number
): Promise<FocusSession[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SESSIONS_STORE, "readonly");
    const index = tx.objectStore(SESSIONS_STORE).index("startTime");
    const range = IDBKeyRange.bound(from, to);
    const req = index.getAll(range);
    req.onsuccess = () => resolve(req.result as FocusSession[]);
    req.onerror = () => reject(req.error);
  });
}

export async function updateSessionMood(
  id: number,
  mood: FocusSession["mood"]
): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SESSIONS_STORE, "readwrite");
    const store = tx.objectStore(SESSIONS_STORE);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const session = getReq.result as FocusSession;
      if (!session) { reject(new Error(`Session not found: ${id}`)); return; }
      session.mood = mood;
      const putReq = store.put(session);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function deleteSession(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SESSIONS_STORE, "readwrite");
    const req = tx.objectStore(SESSIONS_STORE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/** Returns total focus minutes today */
export async function getTodayFocusMinutes(): Promise<number> {
  const now = Date.now();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const sessions = await getSessionsInRange(startOfDay.getTime(), now);
  const totalMs = sessions.reduce((sum, s) => sum + s.durationMs, 0);
  return Math.round(totalMs / 60000);
}

/** Returns sessions for last N days */
export async function getRecentSessions(days: number): Promise<FocusSession[]> {
  const now = Date.now();
  const from = now - days * 24 * 60 * 60 * 1000;
  return getSessionsInRange(from, now);
}
