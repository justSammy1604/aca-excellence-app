"use client";
import { useEffect, useState } from 'react';
import { getStreak, checkInStreak, StreakState } from '@/lib/dataClient';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { motion } from 'framer-motion';

export function StreakBadge() {
  const enabled = isFeatureEnabled('streakTracker');
  const [streak, setStreak] = useState<StreakState | null>(null);
  useEffect(()=>{ if(enabled){ setStreak(getStreak()); } },[enabled]);
  if(!enabled || !streak) return null;
  const onCheckIn = () => setStreak(checkInStreak());
  return (
    <motion.div initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} className="flex items-center gap-3 bg-white/70 backdrop-blur px-4 py-2 rounded shadow border">
      <div className="text-2xl">🔥</div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-semibold">Streak: {streak.count} day{streak.count===1?'':'s'}</span>
        <span className="text-[11px] text-gray-500">Best: {streak.best}</span>
      </div>
      <button onClick={onCheckIn} className="ml-auto text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">Check in</button>
    </motion.div>
  );
}
