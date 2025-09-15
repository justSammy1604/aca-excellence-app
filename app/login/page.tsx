"use client";
import { motion, useAnimation, useMotionValueEvent, useScroll } from "framer-motion";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

// Mock student data (simplified for login)
const mockStudents = {
  student1: { name: "Alice Johnson", password: "pass123" },
  student2: { name: "Bob Smith", password: "pass456" },
};

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { scrollY } = useScroll();
  const controls = useAnimation();
  const [hasScrolled, setHasScrolled] = useState(false);
  const lastYRef = useRef(0);
  useMotionValueEvent(scrollY, "change", (latest) => {
    if (!hasScrolled) setHasScrolled(true);
    const last = lastYRef.current as number;
    const delta = latest - last;
    // Threshold to avoid jitter on tiny scrolls
    if (delta > 1) {
      controls.start("visible");
    } else if (delta < -1) {
      controls.start("hidden");
    }
    lastYRef.current = latest;
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 24, pointerEvents: "none" as const },
    visible: { opacity: 1, y: 0, pointerEvents: "auto" as const },
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const student = mockStudents[username as keyof typeof mockStudents];
    if (student && student.password === password) {
      router.push(`/dashboard?student=${encodeURIComponent(username)}`);
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-[200vh] bg-gray-100">
      {/* Center viewport section */}
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate={hasScrolled ? controls : "hidden"}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border"
        >
        <h1 className="text-3xl font-bold text-blue-800 text-center mb-6">Student Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter student ID (e.g., student1)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter password"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
          >
            Login
          </motion.button>
        </form>
        </motion.div>
      </div>
    </div>
  );
}
