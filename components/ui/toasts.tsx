"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import type { Toast as ToastType } from "@/hooks/custom-toast/use-toast";
import { createPortal } from "react-dom";

const variants = {
  initial: { opacity: 0, y: -50, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

const backgrounds = {
  error: "bg-red-100",
  warning: "bg-amber-100",
  info: "bg-sky-100",
  success: "bg-green-100",
};

const icons = {
  error: <AlertCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertCircle className="h-5 w-5 text-amber-500" />,
  info: <Info className="h-5 w-5 text-sky-500" />,
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
};

interface ToastProps {
  toasts: ToastType[];
  removeToast: (id: string) => void;
}

export function Toast({ toasts, removeToast }: ToastProps) {
  if (typeof window === "undefined") return null; 

  return createPortal(
    <div className="fixed top-4 right-4 flex flex-col gap-2 z-[9999]">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`${
              backgrounds[toast.variant]
            } rounded-lg p-4 shadow-lg flex items-center justify-between w-full max-w-md`}
          >
            <div className="flex items-center gap-3">
              {icons[toast.variant]}
              <p className="text-gray-900 text-sm font-medium">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}
