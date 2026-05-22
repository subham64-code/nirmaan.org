"use client";

import React, { createContext, useContext, useCallback, useState } from "react";

type ToastType = "success" | "error" | "info";
type Toast = { id: string; type: ToastType; message: string };

const ToastContext = createContext<{
  showToast: (type: ToastType, message: string) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 8);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div aria-live="polite" className="fixed right-6 bottom-6 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm w-full px-4 py-2 rounded-lg shadow-lg text-sm text-white flex items-center justify-between gap-4 ${
              toast.type === "success" ? "bg-green-600" : toast.type === "error" ? "bg-red-600" : "bg-blue-600"
            }`}
          >
            <div className="flex-1 pr-2">{toast.message}</div>
            <button
              onClick={() => setToasts((t) => t.filter((x) => x.id !== toast.id))}
              aria-label="Dismiss"
              className="opacity-80 hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx.showToast;
}

export default ToastProvider;
