"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useCurrentStudent } from "@/lib/authClient";
import BackToHome from "@/components/BackToHome";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { loading, studentKey, displayName } = useCurrentStudent();
  // Dark mode removed

  // Redirect to login when not authenticated once loading completes
  useEffect(() => {
    if (!loading) {
      if (!studentKey) {
        router.replace("/login");
        return;
      }
      try {
        const role = localStorage.getItem("role");
        if (role === "admin") {
          router.replace("/admin");
        }
      } catch {}
    }
  }, [loading, studentKey, router]);

  const nav = useMemo(
    () => [
      { href: "/student/dashboard", label: "Dashboard" },
      { href: "/student/nudges", label: "Nudges" },
      { href: "/student/resources", label: "Resources" },
    ],
    []
  );

  const onLogout = () => {
    try {
      localStorage.removeItem("currentStudent");
    } finally {
      router.replace("/login");
    }
  };

  if (loading || (!studentKey)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-blue-800">Student{displayName ? ` • ${displayName}` : ""}</span>
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    "px-3 py-1 rounded-md text-sm " +
                    (active ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100")
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <button
            onClick={onLogout}
            className="px-3 py-1 rounded-md text-sm bg-gray-200 hover:bg-gray-300"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-4">
        <BackToHome />
        {children}
      </main>
    </div>
  );
}
