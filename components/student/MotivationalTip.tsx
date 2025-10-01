"use client";
import { useEffect, useState } from 'react';
import { getTip } from '@/lib/dataClient';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { motion } from 'framer-motion';

export function MotivationalTip(){
  const enabled = isFeatureEnabled('motivationalTip'); 
  const [tip,setTip] = useState('');
  useEffect(()=>{ if(enabled){ setTip(getTip()); } },[enabled]);
  if(!enabled || !tip) return null;
  return (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} className="mt-6 p-4 bg-gradient-to-r from-amber-100 to-yellow-100 rounded shadow border text-sm text-amber-800">
      <span className="font-medium mr-2">Tip:</span>{tip}
    </motion.div>
  );
}
