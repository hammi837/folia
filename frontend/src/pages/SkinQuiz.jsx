import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import Button from "../components/ui/Button";
import ProductCard from "../components/product/ProductCard";
import Spinner from "../components/ui/Spinner";

const STEPS = [
  {
    key: "skin_type",
    title: "What’s your skin type?",
    options: [
      { value: "dry", label: "Dry" },
      { value: "oily", label: "Oily" },
      { value: "combination", label: "Combination" },
      { value: "sensitive", label: "Sensitive" },
      { value: "normal", label: "Normal" },
    ],
  },
  {
    key: "concern",
    title: "Primary concern right now?",
    options: [
      { value: "barrier", label: "Barrier / sensitivity" },
      { value: "hydration", label: "Hydration" },
      { value: "dullness", label: "Dullness" },
      { value: "acne", label: "Congestion / acne" },
      { value: "aging", label: "Early aging" },
      { value: "redness", label: "Redness" },
    ],
  },
  {
    key: "texture",
    title: "Preferred texture?",
    options: [
      { value: "serum", label: "Serum" },
      { value: "cream", label: "Cream" },
      { value: "oil", label: "Oil" },
      { value: "gel", label: "Gel" },
    ],
  },
  {
    key: "scent",
    title: "Scent preference?",
    options: [
      { value: "unscented", label: "Unscented" },
      { value: "botanical", label: "Soft botanical" },
    ],
  },
];

export default function SkinQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const current = STEPS[step];
  const progress = ((step + (results ? 1 : 0)) / STEPS.length) * 100;

  const select = async (value) => {
    const next = { ...answers, [current.key]: value };
    setAnswers(next);
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/quiz/recommend", next);
      setResults(data.recommendations || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResults(null);
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-14 md:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-folia-moss">Skin quiz</p>
      <h1 className="mt-3 font-display text-4xl md:text-5xl">Find your ritual</h1>
      <div className="mt-8 h-1 overflow-hidden rounded-full bg-folia-sand">
        <div className="h-full bg-folia-moss transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }} />
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Spinner />
        </div>
      ) : results ? (
        <div className="mt-12">
          <h2 className="font-display text-3xl">Your matches</h2>
          <p className="mt-2 text-folia-ink/60">A short edit based on your answers.</p>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button to="/shop">Browse all</Button>
            <Button variant="secondary" onClick={reset}>
              Retake quiz
            </Button>
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={current.key}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
            className="mt-12"
          >
            <p className="text-sm text-folia-ink/50">
              Step {step + 1} of {STEPS.length}
            </p>
            <h2 className="mt-2 font-display text-3xl">{current.title}</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {current.options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => select(opt.value)}
                  className="rounded-2xl border border-folia-sand bg-white/50 px-5 py-4 text-left transition hover:border-folia-moss hover:bg-folia-mist/60"
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {step > 0 && (
              <button
                type="button"
                className="mt-8 text-sm text-folia-ink/50 hover:text-folia-moss"
                onClick={() => setStep((s) => s - 1)}
              >
                Back
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
}
