"use client";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { isFeatureEnabled } from "@/lib/featureFlags";

type Toast = { id: number; title?: string; message: string; variant?: "success"|"error"|"info"; timeout?: number };

const ToastContext = createContext<{ toast: (msg: string, opts?: Omit<Toast, "id"|"message">) => void }|null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const enabled = isFeatureEnabled("toastSystem");
  const [list, setList] = useState<Toast[]>([]);
  const toast = useCallback((message: string, opts?: Omit<Toast, "id"|"message">) => {
    if (!enabled) return;
    const id = Date.now() + Math.random();
    const t: Toast = { id, message, variant: opts?.variant || "info", title: opts?.title, timeout: opts?.timeout ?? 2500 };
    setList(l => [...l, t]);
    setTimeout(() => setList(l => l.filter(x => x.id !== id)), t.timeout);
  }, [enabled]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {enabled && list.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          {list.map(t => (
            <div key={t.id} role="status" aria-live="polite" className={
              `min-w-[260px] max-w-sm rounded-lg shadow-lg border px-3 py-2 text-sm bg-white ` +
              (t.variant === 'success' ? 'border-green-300' : t.variant === 'error' ? 'border-red-300' : 'border-gray-200')
            }>
              {t.title && <div className="font-semibold mb-0.5">{t.title}</div>}
              <div>{t.message}</div>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { toast: () => {} };
  return ctx;
}
