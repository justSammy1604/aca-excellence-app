"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Mock student data (simplified for login)


export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // Keep login card always visible (no fade on scroll)

const handleLogin = (e: React.FormEvent) => {
  e.preventDefault();
  const storedUsers = JSON.parse(localStorage.getItem("students") || "{}");
  const student = storedUsers[username];

  if (student && student.password === password) {
    router.push(`/student/dashboard?student=${encodeURIComponent(username)}`);
  } else {
    setError("Invalid username or password");
  }
};


  return (
    <div className="min-h-screen bg-gray-100">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border">
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
        <p className="text-center text-sm mt-2">
          Don’t have an account?{" "}
          <span
            onClick={() => router.push("/signup")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Sign up
          </span>
        </p>
  </div>
      </div>
    </div>
  );
}
