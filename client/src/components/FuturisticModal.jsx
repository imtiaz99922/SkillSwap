import React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import "./FuturisticStyles.css";

export default function FuturisticModal({ isOpen, onClose, title, children }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="futuristic-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="futuristic-modal-panel"
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">
                  System briefing
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-100">
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="modal-close"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            <div className="space-y-5 text-slate-300">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
