"use client";
import { useEffect, useMemo, useState } from "react";
import { getStudent } from "@/lib/dataClient";
import { mockStudents } from "@/lib/mockData";

// For demo: list all mock students. In DB mode, replace with API listing students.
export default function AdminOverviewPage() {
  const [keys, setKeys] = useState<string[]>([]);
  const [dbData, setDbData] = useState<{ students: { id: string; displayName: string }[], resources: { title: string; url: string }[], nudges: { id: string; category: string; message: string }[] }|null>(null);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_DB === 'true') {
      fetch('/api/admin/students').then(r=>r.json()).then(setDbData).catch(()=>setDbData(null));
    } else {
      setKeys(Object.keys(mockStudents));
    }
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-orange-800">Admin Overview</h1>
      <p className="text-gray-700">View student details, progress, pending nudges, and recommended resources.</p>
      {process.env.NEXT_PUBLIC_USE_DB === 'true' && dbData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dbData.students.map(s => (
            <StudentCardDB key={s.id} id={s.id} name={s.displayName} resources={dbData.resources} nudges={dbData.nudges} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {keys.map((id) => (
            <StudentCard key={id} id={id} />
          ))}
        </div>
      )}
    </div>
  );
}

function StudentCard({ id }: { id: string }) {
  const s = useMemo(() => getStudent(id), [id]);
  const progress = s.courses.map(c => c.progress);
  const avg = progress.length ? Math.round(progress.reduce((a,b)=>a+b,0)/progress.length) : 0;
  const pendingNudges = s.nudges.length; // placeholder; real impl should subtract dismissed/completed

  return (
    <div className="bg-white border rounded shadow p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">{s.name}</h2>
        <span className="text-sm px-2 py-0.5 rounded bg-orange-100 border border-orange-300">Avg Progress: {avg}%</span>
      </div>
      <div className="mt-2 text-sm text-gray-700">
        <div>Courses: {s.courses.length}</div>
        <div>Pending nudges: {pendingNudges}</div>
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-medium mb-1">Recommended resources</h3>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          {s.resources.map(r => (
            <li key={r.title}><a className="underline" href={r.link} target="_blank" rel="noreferrer">{r.title}</a></li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StudentCardDB({ id, name, resources, nudges }: { id: string; name: string; resources: { title: string; url: string }[]; nudges: { id: string; category: string; message: string }[] }) {
  const topResources = resources.slice(0, 5);
  const pendingNudges = nudges.length; // Placeholder until per-student state is wired

  return (
    <div className="bg-white border rounded shadow p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">{name}</h2>
        <span className="text-sm px-2 py-0.5 rounded bg-orange-100 border border-orange-300">Nudges: {pendingNudges}</span>
      </div>
      <div className="mt-2 text-sm text-gray-700">
        <div>Student ID: {id}</div>
        <div>Resources available: {resources.length}</div>
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-medium mb-1">Recommended resources</h3>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          {topResources.map((r) => (
            <li key={r.title}><a className="underline" href={r.url} target="_blank" rel="noreferrer">{r.title}</a></li>
          ))}
        </ul>
      </div>
    </div>
  );
}
