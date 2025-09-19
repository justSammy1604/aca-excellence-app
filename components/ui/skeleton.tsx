"use client";
import React from "react";
import { isFeatureEnabled } from "@/lib/featureFlags";

export function Skeleton({ className = "" }: { className?: string }) {
  if (!isFeatureEnabled("skeletonLoaders")) return null;
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} aria-hidden="true" />;
}
