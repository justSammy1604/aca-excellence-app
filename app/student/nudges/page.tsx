"use client";
import { motion } from "framer-motion";
import { useCurrentStudent } from "@/lib/authClient";

export default function StudentNudgesPage() {
  const { loading, student, displayName } = useCurrentStudent();
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
          {student.nudges.map((nudge, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-yellow-100 p-4 rounded-lg shadow"
            >
              {nudge}
            </motion.li>
          ))}
        </ul>
      </section>
    </div>
  );
}
