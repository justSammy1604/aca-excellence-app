"use client";
import { motion } from "framer-motion";
import { useCurrentStudent } from "@/lib/authClient";
import { useEffect, useMemo, useState } from "react";
import { getStudent, getNudgesState, upsertNudgeState, type NudgeState } from "@/lib/dataClient";
import { isFeatureEnabled } from "@/lib/featureFlags";

export default function StudentNudgesPage() {
  const { loading, student: authStudent, displayName } = useCurrentStudent();
  const [states, setStates] = useState<NudgeState[]>([]);
  const enableDismiss = isFeatureEnabled('nudgeSnoozeDismiss');
  const enableTimeline = isFeatureEnabled('nudgeTimeline');
  const student = useMemo(()=> getStudent(authStudent?.id), [authStudent]);

  useEffect(()=>{ if(!loading) setStates(getNudgesState()); }, [loading]);

  function currentState(id: string) { return states.find(s=>s.id===id); }
  function setStatus(id: string, status: NudgeState['status']) {
    const next = upsertNudgeState({ id, status });
    setStates([...next]);
  }
  function snooze(id: string) {
    const until = new Date(Date.now()+ 60*60*1000).toISOString();
    const next = upsertNudgeState({ id, status: 'snoozed', snoozedUntil: until });
    setStates([...next]);
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-600">Loading nudges…</motion.div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <header className="text-center mb-8">
  <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-3xl font-bold text-blue-800">Nudges - {displayName}</motion.h1>
      </header>
      <section>
        <ul className="space-y-4">
          {student.nudges.length === 0 && (
            <li className="text-gray-600">No nudges at the moment.</li>
          )}
          {student.nudges.map((nudge, index) => {
            const id = `n${index}`;
            const st = currentState(id);
            if (st?.status === 'dismissed') return null;
            if (st?.status === 'snoozed' && st.snoozedUntil && new Date(st.snoozedUntil) > new Date()) return null;
            return (
              <motion.li
                key={id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-yellow-100 p-4 rounded-lg shadow border border-yellow-200"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-4">
                    <span>{nudge}</span>
                    {enableDismiss && (
                      <div className="flex gap-2 text-xs">
                        <button onClick={()=> setStatus(id, 'dismissed')} className="px-2 py-1 border rounded">Dismiss</button>
                        <button onClick={()=> snooze(id)} className="px-2 py-1 border rounded">Snooze 1h</button>
                      </div>
                    )}
                  </div>
                  {enableTimeline && (
                    <div className="text-[10px] uppercase tracking-wide text-gray-500">{new Date().toLocaleString()}</div>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
