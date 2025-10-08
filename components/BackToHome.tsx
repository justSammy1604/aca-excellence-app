"use client";
import Link from "next/link";

export default function BackToHome() {
  return (
    <div className="mb-4">
      <Link href="/" className="inline-flex items-center gap-2 text-sm px-3 py-1.5 border rounded bg-white hover:bg-gray-50">
        ← Go back
      </Link>
    </div>
  );
}
