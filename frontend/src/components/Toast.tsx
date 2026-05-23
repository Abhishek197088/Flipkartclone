'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast() {
  const toast = useStore((state) => state.toast);
  const hideToast = useStore((state) => state.hideToast);

  const isSuccess = toast?.type === 'success';

  return (
    <AnimatePresence>
      {toast && toast.message && (
        <motion.div
          key={toast.message}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={hideToast}
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded shadow-lg border cursor-pointer select-none ${
            isSuccess
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 animate-pulse" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600" />
          )}
          <span className="text-xs font-bold">{toast.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
