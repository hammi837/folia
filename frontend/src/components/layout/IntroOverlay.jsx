import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

const SESSION_KEY = "folia_intro_seen";

export default function IntroOverlay() {
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const seen = sessionStorage.getItem(SESSION_KEY);
    if (seen) return;
    setVisible(true);
    document.body.style.overflow = "hidden";

    const done = window.setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, "1");
      setVisible(false);
      document.body.style.overflow = "";
    }, 2600);

    return () => {
      window.clearTimeout(done);
      document.body.style.overflow = "";
    };
  }, [reduced]);

  const skip = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(false);
    document.body.style.overflow = "";
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center bg-folia-moss text-folia-cream"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
          onClick={skip}
          role="presentation"
        >
          <motion.div
            className="absolute inset-0 bg-folia-ink"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
            style={{ transformOrigin: "top" }}
          />

          <div className="relative z-10 px-6 text-center">
            <motion.p
              className="text-[10px] uppercase tracking-[0.45em] text-folia-cream/55"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
            >
              Clean beauty
            </motion.p>

            <div className="mt-5 overflow-hidden">
              <motion.h1
                className="font-display text-5xl tracking-[0.28em] md:text-7xl"
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ delay: 0.45, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              >
                FOLIA
              </motion.h1>
            </div>

            <motion.div
              className="mx-auto mt-8 h-px w-16 bg-folia-cream/40"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.05, duration: 0.55 }}
            />

            <motion.p
              className="mt-6 font-display text-lg text-folia-cream/75 md:text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.25, duration: 0.6 }}
            >
              Skin rituals, distilled.
            </motion.p>
          </div>

          <motion.button
            type="button"
            className="absolute bottom-8 text-[11px] uppercase tracking-[0.28em] text-folia-cream/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
            onClick={skip}
          >
            Enter
          </motion.button>

          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-folia-cream"
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{ delay: 2.05, duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
