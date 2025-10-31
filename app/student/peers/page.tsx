"use client";
import { useEffect, useMemo, useState } from 'react';

type Score = { studentid: string; course: string; score: number };
type PeerData = { mine: Score[]; averages: Record<string, number> };

export default function PeersPage() {
  const [data, setData] = useState<PeerData>({ mine: [], averages: {} });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|undefined>();
  useEffect(() => {
    let keep = true;
    (async () => {
      try {
        const res = await fetch('/api/peer');
        if (!res.ok) throw new Error(await res.text());
        const d = await res.json();
        if (keep) setData(d);
      } catch (e:any) { setErr(String(e?.message||e)); }
      finally { setLoading(false); }
    })();
    return () => { keep = false; };
  }, []);

  const rows = useMemo(() => {
    const set = new Set<string>([...Object.keys(data.averages), ...data.mine.map(m => m.course)]);
    return Array.from(set).map(course => ({
      course,
      mine: data.mine.find(m => m.course === course)?.score,
      avg: data.averages[course]
    }));
  }, [data]);

  if (loading) return <div className="p-4">Loading peers…</div>;
  if (err) return <div className="p-4 text-red-600">{err}</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Peer comparison</h1>
      <table className="w-full border border-gray-200 text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-2 border-b">Course</th>
            <th className="text-left p-2 border-b">My score</th>
            <th className="text-left p-2 border-b">Average</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.course} className="border-b">
              <td className="p-2">{r.course}</td>
              <td className="p-2">{r.mine !== undefined ? r.mine.toFixed(2) : '—'}</td>
              <td className="p-2">{r.avg !== undefined ? r.avg.toFixed(2) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
