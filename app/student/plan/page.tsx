"use client";
import { useEffect, useState } from 'react';

type Block = { start: string; end: string; assignmentId?: string; title?: string };
type Plan = { blocks: Block[] };

export default function PlanPage() {
  const [plan, setPlan] = useState<Plan>({ blocks: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|undefined>();
  useEffect(() => {
    let keep = true;
    (async () => {
      try {
        const res = await fetch('/api/plan');
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (keep) setPlan(data);
      } catch (e:any) { setErr(String(e?.message||e)); }
      finally { setLoading(false); }
    })();
    return () => { keep = false; };
  }, []);

  if (loading) return <div className="p-4">Building your weekly plan…</div>;
  if (err) return <div className="p-4 text-red-600">{err}</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Weekly Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {plan.blocks.map((b, idx) => (
          <div key={idx} className="border rounded p-3">
            <div className="font-medium">{new Date(b.start).toLocaleString()} → {new Date(b.end).toLocaleTimeString()}</div>
            {b.title && <div className="text-sm text-gray-600">{b.title}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
