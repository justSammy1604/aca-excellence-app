"use client";
import { useEffect, useState } from "react";
import { mockStudents } from "@/lib/mockData";

export function getCurrentStudentKey(): string | null { 
  try {
    return localStorage.getItem("currentStudent");
  } catch {
    return null;
  }
}

export function getStudentsMap(): Record<string, { name?: string; password?: string }> {
  try {
    return JSON.parse(localStorage.getItem("students") || "{}");
  } catch {
    return {};
  }
}

export function getDisplayName(studentKey: string | null, fallbackName: string): string {
  const all = getStudentsMap();
  const name = studentKey ? all[studentKey]?.name : undefined;
  return typeof name === "string" && name.trim().length > 0 ? name : fallbackName;
}

export function resolveStudent(studentKey: string | null) {
  const key = (studentKey as keyof typeof mockStudents) || ("student1" as keyof typeof mockStudents);
  const student = mockStudents[key] || mockStudents["student1"];
  return { key: key as string, student };
}

export function useCurrentStudent() {
  const [loading, setLoading] = useState(true);
  const [studentKey, setStudentKey] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>("");

  useEffect(() => {
    try {
      const key = getCurrentStudentKey();
      const { student } = resolveStudent(key);
      setStudentKey(key);
      // start with local fallback
      setDisplayName(getDisplayName(key, student.name));
      // If DB mode is enabled and we have a key, fetch profile for accurate display name
      if (process.env.NEXT_PUBLIC_USE_DB === 'true' && key) {
        (async () => {
          try {
            const res = await fetch(`/api/profile?studentId=${encodeURIComponent(key)}`);
            if (res.ok) {
              const p = await res.json();
              const name = p.displayName || p.displayname || student.name;
              setDisplayName(typeof name === 'string' && name.trim().length > 0 ? name : student.name);
            }
          } catch {
            // ignore network errors; keep fallback
          }
        })();
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const { student } = resolveStudent(studentKey);
  return { loading, studentKey, student, displayName };
}
