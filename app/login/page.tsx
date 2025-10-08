"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentStudentKey } from "@/lib/authClient";

// Mock student data (simplified for login)


export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<'student'|'admin'>("student");
  const [error, setError] = useState("");
  useEffect(() => {
    try {
      const r = localStorage.getItem("role");
      if (r === 'admin') { router.replace('/admin'); return; }
    } catch {}
    const key = getCurrentStudentKey();
    if (key) router.replace("/student/dashboard");
  }, [router]);
  // Keep login card always visible (no fade on scroll)

const handleLogin = (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  if (role === 'admin') {
    const storedAdmins = JSON.parse(localStorage.getItem("admins") || "{}");
    const admin = storedAdmins[username];
    if (admin && admin.password === password) {
      try {
        localStorage.setItem("role", "admin");
        localStorage.setItem("currentAdmin", username);
        localStorage.removeItem("currentStudent");
      } catch {}
      router.push('/admin');
    } else {
      setError("Invalid admin credentials");
    }
  } else {
    const storedUsers = JSON.parse(localStorage.getItem("students") || "{}");
    const student = storedUsers[username];
    if (student && student.password === password) {
      try {
        localStorage.setItem("currentStudent", username);
        localStorage.setItem("role", "student");
      } catch {}
      router.push(`/student/dashboard`);
    } else {
      setError("Invalid username or password");
    }
  }
};


  return (
  <div className="min-h-screen bg-gray-100">
      <div className="min-h-screen flex items-center justify-center px-4">
  <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-200">
  <h1 className="text-3xl font-bold text-blue-800 text-center mb-6">Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Login as</label>
            <div className="mt-1 flex gap-4 text-sm">
              <label className="inline-flex items-center gap-1">
                <input type="radio" name="role" value="student" checked={role==='student'} onChange={()=>setRole('student')} /> Student
              </label>
              <label className="inline-flex items-center gap-1">
                <input type="radio" name="role" value="admin" checked={role==='admin'} onChange={()=>setRole('admin')} /> Admin
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              placeholder={role==='admin' ? 'Enter admin username' : 'Enter student ID (e.g., student1)'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
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
  <p className="text-center text-sm mt-2 text-gray-700">
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
