"use client";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { mockStudents } from "@/lib/mockData";

export default function StudentNudgesPage() {
  const params = useSearchParams();
  const studentKey = params.get("student") || "student1";
  const currentStudent = mockStudents[studentKey as keyof typeof mockStudents] || mockStudents["student1"];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-800">Nudges - {currentStudent.name}</h1>
      </header>
      <section>
        <ul className="space-y-4">
          {currentStudent.nudges.map((nudge, index) => (
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
