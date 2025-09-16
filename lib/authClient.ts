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
      setDisplayName(getDisplayName(key, student.name));
    } finally {
      setLoading(false);
    }
  }, []);

  const { student } = resolveStudent(studentKey);
  return { loading, studentKey, student, displayName };
}
