"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} className="text-[#22C55E]" />,
  error: <AlertCircle size={18} className="text-[#EF4444]" />,
  info: <Info size={18} className="text-[#2563EB]" />,
  warning: <AlertTriangle size={18} className="text-[#F59E0B]" />,
};

const borders: Record<ToastType, string> = {
  success: "border-l-[#22C55E]",
  error: "border-l-[#EF4444]",
  info: "border-l-[#2563EB]",
  warning: "border-l-[#F59E0B]",
};

let nextId = 0;

const ToastCtx = createContext<{
  showToast: (message: string, type?: ToastType) => void;
}>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const remove = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastCtx.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.95 }}
              className={`pointer-events-auto flex items-center gap-3 bg-white rounded-xl shadow-xl border border-[#E2E8F0] border-l-4 ${borders[toast.type]} px-4 py-3 min-w-[280px] max-w-[400px]`}
            >
              {icons[toast.type]}
              <p className="text-sm text-[#0F172A] flex-1">{toast.message}</p>
              <button onClick={() => remove(toast.id)} className="text-[#64748B] hover:text-[#0F172A] transition-colors">
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
