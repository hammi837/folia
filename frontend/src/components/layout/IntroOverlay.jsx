import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

const SESSION_KEY = "folia_intro_seen";

export default function IntroOverlay() {
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduced) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      return;
    }

    setVisible(true);
    document.body.style.overflow = "hidden";

    const done = window.setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
      setVisible(false);
      document.body.style.overflow = "";
    }, 2200);

    return () => {
      window.clearTimeout(done);
      document.body.style.overflow = "";
    };
  }, [reduced]);

  const skip = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
    document.body.style.overflow = "";
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center bg-folia-ink text-folia-cream"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45 } }}
          onClick={skip}
          role="presentation"
        >
          <div className="relative z-10 px-6 text-center">
            <p className="text-[10px] uppercase tracking-[0.45em] text-folia-cream/55">Clean beauty</p>
            <h1 className="mt-5 font-display text-5xl tracking-[0.28em] md:text-7xl">FOLIA</h1>
            <p className="mt-6 font-display text-lg text-folia-cream/75 md:text-xl">
              Skin rituals, distilled.
            </p>
          </div>
          <button
            type="button"
            className="absolute bottom-8 text-[11px] uppercase tracking-[0.28em] text-folia-cream/45"
            onClick={skip}
          >
            Enter / click anywhere
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
