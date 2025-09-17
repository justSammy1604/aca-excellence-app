// dataClient.ts - abstraction layer over mock data + localStorage extensions.
// Swappable later with real DB/API without touching UI components.

import { mockStudents } from "@/lib/mockData";
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

export function getStudent(id?: string) {
  const key = (id || getCurrentStudentKey() || 'student1') as keyof typeof mockStudents;
  return mockStudents[key] || mockStudents['student1'];
}

export type StudentProfile = { targetGpa?: number; learningStyle?: string };
export function getProfile(id?: string): StudentProfile {
  const sid = id || getCurrentStudentKey() || 'student1';
  return readJSON(LS_KEYS.profile(sid), {});
}
export function updateProfile(patch: Partial<StudentProfile>, id?: string) {
  const sid = id || getCurrentStudentKey() || 'student1';
  const current = getProfile(sid);
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

export function evaluateAchievements(id?: string) {
  const sid = id || getCurrentStudentKey() || 'student1';
  const student = getStudent(sid);
  // Example: 3 courses above 70
  const highCourses = student.courses.filter(c => c.progress >= 70).length;
  if (highCourses >= 3) awardAchievement('THREE_COURSES_70', sid);
  const viewed = getResourcesViewed(sid).length;
  if (viewed >= 5) awardAchievement('FIVE_RESOURCES_VIEWED', sid);
}

export function getResourcesViewed(id?: string): string[] {
  const sid = id || getCurrentStudentKey() || 'student1';
  return readJSON(LS_KEYS.resourcesViewed(sid), []);
}
export function recordResourceView(resourceTitle: string, id?: string) {
  const sid = id || getCurrentStudentKey() || 'student1';
  const viewed = getResourcesViewed(sid);
  if (!viewed.includes(resourceTitle)) { viewed.push(resourceTitle); writeJSON(LS_KEYS.resourcesViewed(sid), viewed); }
  logEvent('resource.view', { resourceTitle });
}

export function getFavorites(id?: string): string[] {
  const sid = id || getCurrentStudentKey() || 'student1';
  return readJSON(LS_KEYS.favorites(sid), []);
}
export function toggleFavorite(resourceTitle: string, id?: string) {
  if (!isFeatureEnabled('resourceFavorites')) return getFavorites(id);
  const sid = id || getCurrentStudentKey() || 'student1';
  const favs = getFavorites(sid);
  const idx = favs.indexOf(resourceTitle);
  if (idx >= 0) favs.splice(idx,1); else favs.push(resourceTitle);
  writeJSON(LS_KEYS.favorites(sid), favs); logEvent('resource.favoriteToggle', { resourceTitle, favorited: idx < 0 });
  return favs;
}

export function getVotes(id?: string): Record<string, number> {
  const sid = id || getCurrentStudentKey() || 'student1';
  return readJSON(LS_KEYS.votes(sid), {});
}
export function voteResource(resourceTitle: string, delta: 1|-1, id?: string) {
  if (!isFeatureEnabled('resourceVoting')) return getVotes(id);
  const sid = id || getCurrentStudentKey() || 'student1';
  const votes = getVotes(sid);
  votes[resourceTitle] = (votes[resourceTitle] || 0) + delta;
  writeJSON(LS_KEYS.votes(sid), votes); logEvent('resource.vote', { resourceTitle, score: votes[resourceTitle] });
  return votes;
}

export type NudgeState = { id: string; status: 'active'|'dismissed'|'snoozed'; snoozedUntil?: string };
export function getNudgesState(id?: string): NudgeState[] {
  const sid = id || getCurrentStudentKey() || 'student1';
  return readJSON(LS_KEYS.nudgesState(sid), []);
}
export function upsertNudgeState(state: NudgeState, id?: string) {
  const sid = id || getCurrentStudentKey() || 'student1';
  const list = getNudgesState(sid);
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
