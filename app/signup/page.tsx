"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentStudentKey } from "@/lib/authClient";
import supabase from '@/lib/supabaseClient';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState<'student'|'admin'>("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    try {
      const r = localStorage.getItem('role');
      if (r === 'admin') { router.replace('/admin'); return; }
    } catch {}
    const key = getCurrentStudentKey();
    if (key) router.replace("/student/dashboard");
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !name || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      if (role === 'admin') {
        const admins = JSON.parse(localStorage.getItem('admins') || '{}');
        if (admins[email]) { setError('Admin username already exists'); return; }
        const nextA = { ...admins, [email]: { name, password } };
        localStorage.setItem('admins', JSON.stringify(nextA));
        localStorage.setItem('role', 'admin');
        localStorage.setItem('currentAdmin', email);
        localStorage.removeItem('currentStudent');
        router.push('/admin');
      } else {
        if (process.env.NEXT_PUBLIC_USE_DB === 'true') {
          // Supabase Auth signup
          const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
          if (signUpError) { setError(signUpError.message || 'Could not create account'); return; }
          // Create or upsert a profile/student record keyed by the email as id for now
          try {
            await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentId: email, displayName: name, email }) });
          } catch {}
          try { localStorage.setItem('currentStudent', email); localStorage.setItem('role', 'student'); } catch {}
          router.push(`/student/dashboard`);
        } else {
          const stored = JSON.parse(localStorage.getItem("students") || "{}");
          if (stored[email]) { setError("Username already exists"); return; }
          const next = { ...stored, [email]: { name, password } };
          localStorage.setItem("students", JSON.stringify(next));
          localStorage.setItem("currentStudent", email);
          localStorage.setItem('role', 'student');
          router.push(`/student/dashboard`);
        }
      }
    } catch (err) {
      setError((err as any)?.message || "Could not save account. Please try again.");
    }
    finally { setLoading(false); }
  };

  return (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
  className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border border-gray-200"
      >
  <h1 className="text-3xl font-bold text-blue-800 text-center mb-6">Create Account</h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sign up as</label>
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
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              placeholder={role==='admin' ? 'admin email' : 'you@example.com'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Create a password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Re-enter password"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className={`w-full p-2 rounded-md transition ${loading ? 'bg-gray-400 text-gray-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {loading ? 'Creating…' : 'Sign up'}
          </motion.button>
        </form>
  <p className="text-center text-sm mt-2 text-gray-700">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
          >
            Log in
          </span>
        </p>
      </motion.div>
    </div>
  );
}
