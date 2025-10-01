"use client";
import { useState, useEffect } from "react";
import { isFeatureEnabled } from "@/lib/featureFlags";
import { getProfile, updateProfile, StudentProfile } from "@/lib/dataClient";
import { motion, AnimatePresence } from "framer-motion";

export function ProfileDrawer() {
  const enabled = isFeatureEnabled('profileDrawer'); 
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<StudentProfile>({});
  const [targetGpa, setTargetGpa] = useState<string>("");
  const [learningStyle, setLearningStyle] = useState<string>("");

  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    if (p.targetGpa) setTargetGpa(String(p.targetGpa));
    if (p.learningStyle) setLearningStyle(p.learningStyle);
  }, []);

  const save = () => {
    const next = updateProfile({
      targetGpa: targetGpa ? parseFloat(targetGpa) : undefined,
      learningStyle: learningStyle || undefined,
    });
    setProfile(next);
    setOpen(false);
  };

  if (!enabled) return null; 

  return (
    <div className="inline-block">
      <button onClick={() => setOpen(true)} className="text-sm px-3 py-1 rounded-md bg-white/70 hover:bg-white shadow border">Profile</button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 flex" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <div className="flex-1" onClick={() => setOpen(false)} />
            <motion.div initial={{ x: 320 }} animate={{ x:0 }} exit={{ x: 320 }} transition={{ type:'spring', stiffness:180, damping:20 }} className="w-80 bg-white h-full shadow-xl border-l p-4 flex flex-col gap-4">
              <h2 className="font-semibold text-lg">Student Profile</h2>
              <label className="text-sm font-medium">Target GPA</label>
              <input value={targetGpa} onChange={e=>setTargetGpa(e.target.value)} placeholder="e.g. 3.8" className="border rounded px-2 py-1 text-sm" />
              <label className="text-sm font-medium">Learning Style</label>
              <select value={learningStyle} onChange={e=>setLearningStyle(e.target.value)} className="border rounded px-2 py-1 text-sm">
                <option value="">Select</option>
                <option value="visual">Visual</option>
                <option value="auditory">Auditory</option>
                <option value="reading">Reading/Writing</option>
                <option value="kinesthetic">Kinesthetic</option>
              </select>
              <div className="mt-auto flex gap-2 justify-end">
                <button onClick={()=>setOpen(false)} className="text-sm px-3 py-1 rounded border">Cancel</button>
                <button onClick={save} className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Save</button>
              </div>
              {profile.targetGpa && (
                <div className="text-xs text-gray-500">Current Target: {profile.targetGpa.toFixed(2)}</div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
