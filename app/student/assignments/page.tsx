"use client";
import { useEffect, useState } from 'react';

type Assignment = { id: string; course: string; title: string; due_at: string; estimated_minutes?: number; submitted_at?: string|null; conflict?: boolean };

export default function AssignmentsPage() {
  const [items, setItems] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|undefined>();
  useEffect(() => {
    let keep = true;
    (async () => {
      try {
        const res = await fetch('/api/assignments');
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (keep) setItems(data);
      } catch (e:any) { setErr(String(e?.message||e)); }
      finally { setLoading(false); }
    })();
    return () => { keep = false; };
  }, []);

  const submit = async (id: string) => {
    const res = await fetch('/api/assignments/submit', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id }) });
    if (res.ok) {
      setItems(prev => prev.map(a => a.id === id ? { ...a, submitted_at: new Date().toISOString() } : a));
    }
  };

  if (loading) return <div className="p-4">Loading assignments…</div>;
  if (err) return <div className="p-4 text-red-600">{err}</div>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Assignments</h1>
        <a className="text-blue-600 underline" href="/api/calendar/ics">Add to Calendar (ICS)</a>
      </div>
      <ul className="space-y-2">
        {items.map(a => (
          <li key={a.id} className={`border rounded p-3 ${a.conflict ? 'border-amber-500' : 'border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{a.title} <span className="text-sm text-gray-500">— {a.course}</span></div>
                <div className="text-sm text-gray-600">Due {new Date(a.due_at).toLocaleString()} {a.estimated_minutes ? `• ~${a.estimated_minutes} min` : ''}</div>
                {a.conflict && <div className="text-xs text-amber-700">Conflicts with another due date</div>}
              </div>
              <div>
                {a.submitted_at ? (
                  <span className="text-green-700 text-sm">Submitted</span>
                ) : (
                  <button onClick={() => submit(a.id)} className="px-3 py-1 bg-blue-600 text-white rounded">Mark Submitted</button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
