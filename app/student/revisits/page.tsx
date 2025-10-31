"use client";
import { useEffect, useState } from 'react';

type Revisit = { resourceId: string; title?: string; dueOn: string; intervalDays: number };

export default function RevisitsPage() {
  const [items, setItems] = useState<Revisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|undefined>();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/revisits');
      if (!res.ok) throw new Error(await res.text());
      setItems(await res.json());
    } catch (e: any) {
      setErr(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markReviewed = async (resourceId: string) => {
    await fetch('/api/revisits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resourceId }) });
    await load();
  };

  if (loading) return <div className="p-4">Loading revisits…</div>;
  if (err) return <div className="p-4 text-red-600">{err}</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Revisit reminders</h1>
      {items.length === 0 ? (
        <div className="text-gray-600">No revisits due. Nice work!</div>
      ) : (
        <ul className="space-y-2">
          {items.map((r) => (
            <li key={r.resourceId} className="border rounded p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{r.title || r.resourceId}</div>
                <div className="text-sm text-gray-600">Due {r.dueOn} • Interval {r.intervalDays}d</div>
              </div>
              <button onClick={() => markReviewed(r.resourceId)} className="px-3 py-1 bg-blue-600 text-white rounded">Mark reviewed</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
