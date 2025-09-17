"use client";
import { useEffect, useState } from 'react';
import { getAchievements, evaluateAchievements } from '@/lib/dataClient';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { motion } from 'framer-motion';

const ACHIEVEMENT_LABELS: Record<string,string> = {
  'THREE_COURSES_70': '3 Courses ≥70%',
  'FIVE_RESOURCES_VIEWED': '5 Resources Viewed',
};

export function AchievementsStrip(){
  const enabled = isFeatureEnabled('achievements');
  const [list, setList] = useState<string[]>([]);
  useEffect(()=>{ if(enabled){ evaluateAchievements(); setList(getAchievements()); } },[enabled]);
  if(!enabled || list.length===0) return null;
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex flex-wrap gap-2 mt-4">
      {list.map(code => (
        <span key={code} className="text-xs px-2 py-1 rounded-full bg-indigo-600 text-white shadow">{ACHIEVEMENT_LABELS[code]||code}</span>
      ))}
    </motion.div>
  );
}
