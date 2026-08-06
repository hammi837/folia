import { AnimatePresence, motion } from "framer-motion";
import { useUiStore } from "../../store/uiStore";

export default function Toast() {
  const toast = useUiStore((s) => s.toast);
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-folia-ink px-5 py-3 text-sm text-folia-cream shadow-soft"
        >
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
