// dataClient.ts - DB-first abstraction (Supabase via Next API).
import { getCurrentStudentKey } from "@/lib/authClient";
import { isFeatureEnabled } from "@/lib/featureFlags";

const LS_KEYS = {
  profile: (id: string) => `student:${id}:profile`,
  streak: (id: string) => `student:${id}:streak`,
  achievements: (id: string) => `student:${id}:achievements`,
  resourcesViewed: (id: string) => `student:${id}:resourcesViewed`,
  favorites: (id: string) => `student:${id}:resourceFavorites`,
  votes: (id: string) => `student:${id}:resourceVotes`,
  nudgesState: (id: string) => `student:${id}:nudgesState`,
  syntheticAssignments: (id: string) => `student:${id}:assignmentsSynthetic`,
  events: (id: string) => `student:${id}:events`,
  tip: (id: string) => `student:${id}:lastTip`,
};

function readJSON<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
function writeJSON<T>(key: string, value: T) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }

export type StudentOverview = {
  id: string;
  name: string;
  courses: Array<{ name: string; progress: number; risk: string | null }>;
  gpaTrends: { labels: string[]; data: number[] };
  nudges: string[];
  resources: Array<{ title: string; link: string }>;
};

export async function getStudent(id?: string): Promise<StudentOverview> {
  const key = id || getCurrentStudentKey() || 'student1';
  const res = await fetch(`/api/student/overview?studentId=${encodeURIComponent(key)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('failed to load student overview');
  return res.json() as Promise<StudentOverview>;
}

export type StudentProfile = { targetGpa?: number; learningStyle?: string };
export async function getProfile(id?: string): Promise<StudentProfile> {
  const sid = id || getCurrentStudentKey() || 'student1';
  if (process.env.NEXT_PUBLIC_USE_DB === 'true') {
    try {
      const res = await fetch(`/api/profile?studentId=${encodeURIComponent(sid)}`);
      if (!res.ok) throw new Error('fetch profile failed');
      return await res.json();
    } catch (e) {
      return readJSON(LS_KEYS.profile(sid), {});
    }
  }
  return readJSON(LS_KEYS.profile(sid), {});
}
export async function updateProfile(patch: Partial<StudentProfile>, id?: string) {
  const sid = id || getCurrentStudentKey() || 'student1';
  if (process.env.NEXT_PUBLIC_USE_DB === 'true') {
    try {
      const res = await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: sid, ...patch }) });
      if (!res.ok) throw new Error('profile post failed');
      const next = await res.json();
      logEvent('profile.update', { patch });
      return next;
    } catch (e) {
      // fallback to local
      const current = readJSON(LS_KEYS.profile(sid), {} as StudentProfile);
      const next = { ...current, ...patch };
      writeJSON(LS_KEYS.profile(sid), next);
      logEvent('profile.update', { patch });
      return next;
    }
  }
  const current = readJSON(LS_KEYS.profile(sid), {} as StudentProfile);
  const next = { ...current, ...patch };
  writeJSON(LS_KEYS.profile(sid), next);
  logEvent('profile.update', { patch });
  return next;
}

export type StreakState = { count: number; lastCheckIn?: string; best?: number };
export function getStreak(id?: string): StreakState {
  const sid = id || getCurrentStudentKey() || 'student1';
  return readJSON(LS_KEYS.streak(sid), { count: 0, best: 0 });
}
export function checkInStreak(id?: string) {
  if (!isFeatureEnabled('streakTracker')) return getStreak(id);
  const sid = id || getCurrentStudentKey() || 'student1';
  const today = new Date().toISOString().slice(0,10);
  const s = getStreak(sid);
  if (s.lastCheckIn === today) return s;
  // simple daily increment; real logic would handle gaps
  const nextCount = (s.lastCheckIn && daysBetween(s.lastCheckIn, today) === 1) ? s.count + 1 : 1;
  const best = Math.max(nextCount, s.best || 0);
  const next = { count: nextCount, lastCheckIn: today, best };
  writeJSON(LS_KEYS.streak(sid), next);
  logEvent('streak.checkIn', next);
  return next;
}
function daysBetween(a: string, b: string) { return (new Date(b).getTime() - new Date(a).getTime())/86400000; }

export function getAchievements(id?: string): string[] {
  const sid = id || getCurrentStudentKey() || 'student1';
  return readJSON(LS_KEYS.achievements(sid), []);
}
export function awardAchievement(code: string, id?: string) {
  if (!isFeatureEnabled('achievements')) return;
  const sid = id || getCurrentStudentKey() || 'student1';
  const list = getAchievements(sid);
  if (!list.includes(code)) { list.push(code); writeJSON(LS_KEYS.achievements(sid), list); logEvent('achievement.award', { code }); }
}

export async function evaluateAchievements(id?: string) {
  const sid = id || getCurrentStudentKey() || 'student1';
  const student = await getStudent(sid);
  // Example: 3 courses above 70
  const highCourses = student.courses.filter((c: { progress: number }) => c.progress >= 70).length;
  if (highCourses >= 3) awardAchievement('THREE_COURSES_70', sid);
  const viewedArr = await getResourcesViewed(sid);
  const viewed = viewedArr.length;
  if (viewed >= 5) awardAchievement('FIVE_RESOURCES_VIEWED', sid);
}

export async function getResourcesViewed(id?: string): Promise<string[]> {
  const sid = id || getCurrentStudentKey() || 'student1';
  if (process.env.NEXT_PUBLIC_USE_DB === 'true') {
    try {
      const res = await fetch(`/api/views?studentId=${encodeURIComponent(sid)}`);
      if (!res.ok) throw new Error('fetch views failed');
      return await res.json();
    } catch (e) {
      // fallback
      return readJSON(LS_KEYS.resourcesViewed(sid), []);
    }
  }
  return readJSON(LS_KEYS.resourcesViewed(sid), []);
}
export async function recordResourceView(resourceTitle: string, id?: string) {
  const sid = id || getCurrentStudentKey() || 'student1';
  if (process.env.NEXT_PUBLIC_USE_DB === 'true') {
    try {
      await fetch('/api/views', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: sid, resourceTitle }) });
    } catch (e) {
      // ignore
    }
  } else {
    const viewed = readJSON(LS_KEYS.resourcesViewed(sid), [] as string[]);
    if (!viewed.includes(resourceTitle)) { viewed.push(resourceTitle); writeJSON(LS_KEYS.resourcesViewed(sid), viewed); }
  }
  logEvent('resource.view', { resourceTitle });
}

export async function getFavorites(id?: string): Promise<string[]> {
  const sid = id || getCurrentStudentKey() || 'student1';
  if (!isFeatureEnabled('resourceFavorites')) return readJSON(LS_KEYS.favorites(sid), []);
  if (process.env.NEXT_PUBLIC_USE_DB === 'true') {
    try {
      const res = await fetch(`/api/favorites?studentId=${encodeURIComponent(sid)}`);
      if (!res.ok) throw new Error('fetch favorites failed');
      return await res.json();
    } catch (e) {
      return readJSON(LS_KEYS.favorites(sid), []);
    }
  }
  return readJSON(LS_KEYS.favorites(sid), []);
}
export async function toggleFavorite(resourceTitle: string, id?: string) {
  if (!isFeatureEnabled('resourceFavorites')) return getFavorites(id as any);
  const sid = id || getCurrentStudentKey() || 'student1';
  if (process.env.NEXT_PUBLIC_USE_DB === 'true') {
    try {
      await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: sid, resourceTitle }) });
      return getFavorites(sid);
    } catch (e) {
      return readJSON(LS_KEYS.favorites(sid), []);
    }
  }
  const favs = readJSON(LS_KEYS.favorites(sid), [] as string[]);
  const idx = favs.indexOf(resourceTitle);
  if (idx >= 0) favs.splice(idx,1); else favs.push(resourceTitle);
  writeJSON(LS_KEYS.favorites(sid), favs); logEvent('resource.favoriteToggle', { resourceTitle, favorited: idx < 0 });
  return favs;
}

export async function getVotes(id?: string): Promise<Record<string, number>> {
  const sid = id || getCurrentStudentKey() || 'student1';
  if (!isFeatureEnabled('resourceVoting')) return readJSON(LS_KEYS.votes(sid), {});
  if (process.env.NEXT_PUBLIC_USE_DB === 'true') {
    try {
      const res = await fetch(`/api/votes?studentId=${encodeURIComponent(sid)}`);
      if (!res.ok) throw new Error('fetch votes failed');
      return await res.json();
    } catch (e) {
      return readJSON(LS_KEYS.votes(sid), {});
    }
  }
  return readJSON(LS_KEYS.votes(sid), {});
}
export async function voteResource(resourceTitle: string, delta: 1|-1, id?: string) {
  if (!isFeatureEnabled('resourceVoting')) return getVotes(id as any);
  const sid = id || getCurrentStudentKey() || 'student1';
  if (process.env.NEXT_PUBLIC_USE_DB === 'true') {
    try {
      const res = await fetch('/api/votes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: sid, resourceTitle, delta }) });
      if (!res.ok) throw new Error('vote post failed');
      return res.json();
    } catch (e) {
      return readJSON(LS_KEYS.votes(sid), {});
    }
  }
  const votes = readJSON(LS_KEYS.votes(sid), {} as Record<string, number>);
  votes[resourceTitle] = (votes[resourceTitle] || 0) + delta;
  writeJSON(LS_KEYS.votes(sid), votes); logEvent('resource.vote', { resourceTitle, score: votes[resourceTitle] });
  return votes;
}

export type NudgeState = { id: string; status: 'active'|'dismissed'|'snoozed'; snoozedUntil?: string };
export async function getNudgesState(id?: string): Promise<NudgeState[]> {
  const sid = id || getCurrentStudentKey() || 'student1';
  if (process.env.NEXT_PUBLIC_USE_DB === 'true') {
    try {
      const res = await fetch(`/api/nudges?studentId=${encodeURIComponent(sid)}`);
      if (!res.ok) throw new Error('fetch nudges failed');
      return await res.json();
    } catch (e) {
      return readJSON(LS_KEYS.nudgesState(sid), []);
    }
  }
  return readJSON(LS_KEYS.nudgesState(sid), []);
}
export async function upsertNudgeState(state: NudgeState, id?: string) {
  const sid = id || getCurrentStudentKey() || 'student1';
  if (process.env.NEXT_PUBLIC_USE_DB === 'true') {
    try {
      const res = await fetch('/api/nudges', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: sid, nudgeId: state.id, status: state.status, snoozedUntil: state.snoozedUntil }) });
      if (!res.ok) throw new Error('upsert nudge failed');
      return res.json();
    } catch (e) {
      const list = readJSON(LS_KEYS.nudgesState(sid), [] as NudgeState[]);
      const idx = list.findIndex(n => n.id === state.id);
      if (idx >= 0) list[idx] = state; else list.push(state);
      writeJSON(LS_KEYS.nudgesState(sid), list);
      return list;
    }
  }
  const list = readJSON(LS_KEYS.nudgesState(sid), [] as NudgeState[]);
  const idx = list.findIndex(n => n.id === state.id);
  if (idx >= 0) list[idx] = state; else list.push(state);
  writeJSON(LS_KEYS.nudgesState(sid), list); logEvent('nudge.state', state);
  return list;
}

const TIPS = [
  'Review your notes within 24h to boost retention.',
  'Short, frequent study sessions beat cramming.',
  'Teach a concept aloud to test understanding.',
  'Prioritize hardest tasks when your energy is highest.'
];
export function getTip(id?: string) {
  const sid = id || getCurrentStudentKey() || 'student1';
  const last = readJSON<{ tip: string; date: string }>(LS_KEYS.tip(sid), { tip: '', date: '' });
  const today = new Date().toISOString().slice(0,10);
  if (last.date === today) return last.tip;
  const tip = TIPS[Math.floor(Math.random()*TIPS.length)];
  writeJSON(LS_KEYS.tip(sid), { tip, date: today });
  return tip;
}

export interface EventLogEntry<P = unknown> { type: string; payload: P; ts: number }
export function logEvent<P = unknown>(type: string, payload: P) {
  if (!isFeatureEnabled('eventLog')) return;
  const sid = getCurrentStudentKey() || 'student1';
  const arr = readJSON<EventLogEntry[]>(LS_KEYS.events(sid), []);
  const entry: EventLogEntry<P> = { type, payload, ts: Date.now() };
  arr.push(entry);
  writeJSON(LS_KEYS.events(sid), arr);
}
export function listEvents(limit = 100) {
  const sid = getCurrentStudentKey() || 'student1';
  const arr = readJSON<EventLogEntry[]>(LS_KEYS.events(sid), []);
  return arr.slice(-limit).reverse();
}

// Synthetic assignments (basic mock)
export type SyntheticAssignment = { id: string; title: string; dueAt: string; completed?: boolean };
export function getSyntheticAssignments(id?: string): SyntheticAssignment[] {
  const sid = id || getCurrentStudentKey() || 'student1';
  let list = readJSON<SyntheticAssignment[]>(LS_KEYS.syntheticAssignments(sid), []);
  if (list.length === 0 && isFeatureEnabled('syntheticAssignments')) {
    // generate 4 tasks
    const now = Date.now();
    list = Array.from({ length: 4 }).map((_,i) => ({
      id: `a${i}-${sid}`,
      title: `Assignment ${i+1}`,
      dueAt: new Date(now + (i+1)*86400000).toISOString(),
    }));
    writeJSON(LS_KEYS.syntheticAssignments(sid), list);
  }
  return list;
}
export function toggleAssignmentCompletion(assignmentId: string, id?: string) {
  const sid = id || getCurrentStudentKey() || 'student1';
  const list = getSyntheticAssignments(sid).map(a => a.id === assignmentId ? { ...a, completed: !a.completed } : a);
  writeJSON(LS_KEYS.syntheticAssignments(sid), list); logEvent('assignment.toggle', { assignmentId });
  return list;
}
