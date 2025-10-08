"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import BackToHome from "@/components/BackToHome";

// Simple role guard using localStorage flag for demo purposes
function useAdminGuard() {
  const router = useRouter();
  useEffect(() => {
    try {
      const role = localStorage.getItem("role");
      if (role !== "admin") {
        router.replace("/");
      }
    } catch {
      router.replace("/");
    }
  }, [router]);
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useAdminGuard();
  const pathname = usePathname();
  const router = useRouter();
  const nav = [
    { href: "/admin", label: "Overview" },
  ];
  const onLogout = () => {
    try {
      localStorage.removeItem("role");
      localStorage.removeItem("currentAdmin");
    } finally {
      router.replace("/login");
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <nav className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-orange-800">Admin</span>
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={"px-3 py-1 rounded-md text-sm " + (active ? "bg-orange-600 text-white" : "text-gray-700 hover:bg-gray-100")}>{item.label}</Link>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Role-gated area</span>
            <button onClick={onLogout} className="px-3 py-1 rounded-md text-sm bg-gray-200 hover:bg-gray-300">Logout</button>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-4">
        <BackToHome />
        {children}
      </main>
    </div>
  );
}
