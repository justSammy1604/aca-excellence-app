"use client";
import { useEffect, useState } from 'react';

type Session = { id: string; course?: string; started_at: string; duration_min?: number; mood_pre?: number; focus_pre?: number; mood_post?: number; focus_post?: number; notes?: string };

export default function CheckinsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [active, setActive] = useState<Session|undefined>();
  const [course, setCourse] = useState('');
  const [moodPre, setMoodPre] = useState(3);
  const [focusPre, setFocusPre] = useState(3);
  const [moodPost, setMoodPost] = useState(3);
  const [focusPost, setFocusPost] = useState(3);
  const [notes, setNotes] = useState('');

  const load = async () => {
    const res = await fetch('/api/study-sessions');
    if (res.ok) setSessions(await res.json());
  };
  useEffect(() => { load(); }, []);

  const start = async () => {
    const res = await fetch('/api/study-sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ course, moodPre, focusPre }) });
    if (res.ok) {
      const s = await res.json();
      setActive(s);
      setCourse('');
    }
  };
  const complete = async () => {
    if (!active) return;
    const started = new Date(active.started_at).getTime();
    const durationMin = Math.max(5, Math.round((Date.now() - started)/60000));
    const res = await fetch('/api/study-sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: active.id, complete: true, durationMin, moodPost, focusPost, notes }) });
    if (res.ok) {
      setActive(undefined);
      setNotes('');
      await load();
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Study Check-ins</h1>
      {!active ? (
        <div className="space-y-2 border rounded p-3">
          <div>
            <label className="block text-sm">Course</label>
            <input value={course} onChange={e=>setCourse(e.target.value)} className="border rounded px-2 py-1 w-full" placeholder="e.g., Quantitative Methods" />
          </div>
          <div className="flex gap-4">
            <label className="text-sm">Mood: <input type="number" min={1} max={5} value={moodPre} onChange={e=>setMoodPre(+e.target.value)} className="border rounded w-16 px-2 py-1"/></label>
            <label className="text-sm">Focus: <input type="number" min={1} max={5} value={focusPre} onChange={e=>setFocusPre(+e.target.value)} className="border rounded w-16 px-2 py-1"/></label>
          </div>
          <button onClick={start} className="px-3 py-1 bg-blue-600 text-white rounded">Start Session</button>
        </div>
      ) : (
        <div className="space-y-2 border rounded p-3">
          <div>Started at: {new Date(active.started_at).toLocaleTimeString()} {active.course ? `• ${active.course}` : ''}</div>
          <div className="flex gap-4">
            <label className="text-sm">Mood (post): <input type="number" min={1} max={5} value={moodPost} onChange={e=>setMoodPost(+e.target.value)} className="border rounded w-16 px-2 py-1"/></label>
            <label className="text-sm">Focus (post): <input type="number" min={1} max={5} value={focusPost} onChange={e=>setFocusPost(+e.target.value)} className="border rounded w-16 px-2 py-1"/></label>
          </div>
          <div>
            <label className="block text-sm">Notes</label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} className="border rounded px-2 py-1 w-full" rows={3} />
          </div>
          <button onClick={complete} className="px-3 py-1 bg-green-600 text-white rounded">Complete Session</button>
        </div>
      )}

      <div>
        <h2 className="font-medium mb-2">Recent Sessions</h2>
        <ul className="space-y-2">
          {sessions.map(s => (
            <li key={s.id} className="border rounded p-3 text-sm">
              {new Date(s.started_at).toLocaleString()} — {s.duration_min ? `${s.duration_min} min` : 'in-progress'} {s.course ? `• ${s.course}` : ''}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
