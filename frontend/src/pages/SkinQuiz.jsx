import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import Button from "../components/ui/Button";
import ProductCard from "../components/product/ProductCard";
import SoftImage from "../components/ui/SoftImage";
import Spinner from "../components/ui/Spinner";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const STEPS = [
  {
    key: "skin_type",
    title: "What’s your skin type?",
    subtitle: "Tell us a little about your skin so we can personalize your ritual.",
    options: [
      {
        value: "dry",
        label: "Dry",
        hint: "Feels tight or flaky",
        icon: "drop",
      },
      {
        value: "oily",
        label: "Oily",
        hint: "Prone to excess shine",
        icon: "shine",
      },
      {
        value: "combination",
        label: "Combination",
        hint: "Dry + oily areas",
        icon: "balance",
      },
      {
        value: "sensitive",
        label: "Sensitive",
        hint: "Easily irritated",
        icon: "leaf",
      },
      {
        value: "normal",
        label: "Normal",
        hint: "Balanced and comfortable",
        icon: "calm",
      },
    ],
  },
  {
    key: "concern",
    title: "Primary concern right now?",
    subtitle: "We’ll prioritize formulas that speak to this first.",
    options: [
      {
        value: "barrier",
        label: "Barrier / sensitivity",
        hint: "Calm, strengthen, soothe",
        icon: "shield",
      },
      {
        value: "hydration",
        label: "Hydration",
        hint: "Plump and quench",
        icon: "drop",
      },
      {
        value: "dullness",
        label: "Dullness",
        hint: "Restore soft radiance",
        icon: "shine",
      },
      {
        value: "acne",
        label: "Congestion / acne",
        hint: "Clear without stripping",
        icon: "clear",
      },
      {
        value: "aging",
        label: "Early aging",
        hint: "Firmness and resilience",
        icon: "time",
      },
      {
        value: "redness",
        label: "Redness",
        hint: "Cool and comfort",
        icon: "leaf",
      },
    ],
  },
  {
    key: "texture",
    title: "Preferred texture?",
    subtitle: "Choose the finish that feels right in your routine.",
    options: [
      {
        value: "serum",
        label: "Serum",
        hint: "Light, layerable actives",
        icon: "drop",
      },
      {
        value: "cream",
        label: "Cream",
        hint: "Cushioned, comforting",
        icon: "cream",
      },
      {
        value: "oil",
        label: "Oil",
        hint: "Rich seal and glow",
        icon: "oil",
      },
      {
        value: "gel",
        label: "Gel",
        hint: "Fresh, weightless feel",
        icon: "gel",
      },
    ],
  },
  {
    key: "scent",
    title: "Scent preference?",
    subtitle: "A quiet finishing note for your ritual.",
    options: [
      {
        value: "unscented",
        label: "Unscented",
        hint: "Clean and fragrance-free",
        icon: "calm",
      },
      {
        value: "botanical",
        label: "Soft botanical",
        hint: "Subtle plant notes",
        icon: "leaf",
      },
    ],
  },
];

function OptionIcon({ name }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true,
    className: "shrink-0",
  };
  switch (name) {
    case "shine":
      return (
        <svg {...common}>
          <path
            d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "balance":
      return (
        <svg {...common}>
          <path
            d="M12 4v16M5 9h14M7 9l-2 6h6l-2-6M13 9l-2 6h6l-2-6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "leaf":
      return (
        <svg {...common}>
          <path
            d="M5 19c8 0 12-6 12-14-6 0-12 4-12 12Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M5 19c3-3 6-6 9-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path
            d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "clear":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "time":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 8v4.5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "cream":
      return (
        <svg {...common}>
          <path
            d="M7 10h10v8a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-8Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M9 10V8a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "oil":
      return (
        <svg {...common}>
          <path
            d="M12 3c3 4 5 7 5 10a5 5 0 1 1-10 0c0-3 2-6 5-10Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "gel":
      return (
        <svg {...common}>
          <path
            d="M8 7h8v10a4 4 0 0 1-8 0V7Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M10 4h4v3h-4V4Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "calm":
      return (
        <svg {...common}>
          <path
            d="M4 14c2-1 4-1 6 0s4 1 6 0 4-1 6 0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M4 10c2-1 4-1 6 0s4 1 6 0 4-1 6 0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "drop":
    default:
      return (
        <svg {...common}>
          <path
            d="M12 3c3.5 4.5 6 7.5 6 11a6 6 0 1 1-12 0c0-3.5 2.5-6.5 6-11Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

function ProgressSteps({ currentStep, total, done }) {
  const activeIndex = done ? total : currentStep;
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-folia-ink/50">
          {done ? "Complete" : `Step ${currentStep + 1} of ${total}`}
        </p>
        <p className="text-xs text-folia-ink/45">{Math.round(((activeIndex) / total) * 100)}%</p>
      </div>
      <ol className="mt-4 flex items-center gap-2" aria-label="Quiz progress">
        {Array.from({ length: total }).map((_, i) => {
          const complete = done || i < currentStep;
          const active = !done && i === currentStep;
          return (
            <li key={i} className="flex-1">
              <span
                className={`block h-1.5 rounded-full transition-all duration-500 ${
                  complete || active ? "bg-folia-moss" : "bg-folia-sand"
                } ${active ? "opacity-100" : complete ? "opacity-90" : "opacity-100"}`}
                aria-current={active ? "step" : undefined}
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function SkinQuiz() {
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [quizImage, setQuizImage] = useState(null);

  const current = STEPS[step];

  useEffect(() => {
    document.title = "Skin Quiz · FOLIA";
  }, []);

  useEffect(() => {
    api
      .get("/settings/")
      .then((r) => setQuizImage(r.data.quiz_image_url || null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setSelected(answers[current?.key] ?? null);
  }, [step, current?.key, answers]);

  const submitAnswers = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post("/quiz/recommend", payload);
      setResults(data.recommendations || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const continueQuiz = async () => {
    if (!selected || !current) return;
    const next = { ...answers, [current.key]: selected };
    setAnswers(next);
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    await submitAnswers(next);
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setSelected(null);
    setResults(null);
  };

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-gradient-to-b from-folia-mist/70 via-folia-cream/40 to-transparent"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-site px-4 py-12 md:px-6 md:py-16">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
          <div className="order-2 lg:order-1">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-folia-moss">Skin quiz</p>
            <h1 className="mt-3 max-w-xl font-display text-4xl text-balance md:text-5xl lg:text-[3.35rem] lg:leading-[1.1]">
              Find your ritual
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-folia-ink/60 md:text-base">
              A short consultation to match clean formulas to your skin — four calm questions, one
              personal edit.
            </p>

            <ProgressSteps currentStep={step} total={STEPS.length} done={Boolean(results)} />

            {loading ? (
              <div className="flex justify-center py-24">
                <Spinner />
              </div>
            ) : results ? (
              <div className="mt-10">
                <h2 className="font-display text-3xl md:text-4xl">Your matches</h2>
                <p className="mt-2 text-folia-ink/60">A short edit based on your answers.</p>
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  {results.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
                {results.length === 0 && (
                  <p className="mt-4 text-sm text-folia-ink/55">
                    No exact matches yet — explore the full shop for your ritual.
                  </p>
                )}
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
                  initial={reduced ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-10"
                >
                  <h2 className="font-display text-3xl text-balance md:text-4xl">{current.title}</h2>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-folia-ink/55 md:text-base">
                    {current.subtitle}
                  </p>

                  <div
                    className="mt-8 grid gap-3 sm:grid-cols-2"
                    role="radiogroup"
                    aria-label={current.title}
                  >
                    {current.options.map((opt) => {
                      const isSelected = selected === opt.value;
                      return (
                        <motion.button
                          key={opt.value}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSelected(opt.value)}
                          whileTap={reduced ? undefined : { scale: 0.985 }}
                          className={`group rounded-2xl border px-5 py-4 text-left shadow-soft transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-folia-moss ${
                            isSelected
                              ? "border-folia-moss bg-folia-mist/80 ring-1 ring-folia-moss/30"
                              : "border-folia-sand/90 bg-white/55 hover:border-folia-leaf/40 hover:bg-white/90"
                          }`}
                        >
                          <span className="flex items-start gap-3">
                            <span
                              className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-full transition ${
                                isSelected
                                  ? "bg-folia-moss text-folia-cream"
                                  : "bg-folia-cream text-folia-moss group-hover:bg-folia-mist"
                              }`}
                            >
                              <OptionIcon name={opt.icon} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-medium text-folia-ink">{opt.label}</span>
                              <span className="mt-1 block text-sm leading-snug text-folia-ink/55">
                                {opt.hint}
                              </span>
                            </span>
                            <span
                              className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                                isSelected
                                  ? "border-folia-moss bg-folia-moss text-folia-cream"
                                  : "border-folia-sand bg-transparent"
                              }`}
                              aria-hidden="true"
                            >
                              {isSelected && (
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                  <path
                                    d="M2.5 6.2 4.8 8.5 9.5 3.5"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </span>
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>

                  <p className="mt-6 text-sm text-folia-ink/45">
                    Your answers help us personalize your skincare ritual.
                  </p>

                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <Button
                      size="lg"
                      onClick={continueQuiz}
                      disabled={!selected}
                      aria-disabled={!selected}
                    >
                      {step < STEPS.length - 1 ? "Continue" : "See my matches"}
                      <span aria-hidden="true">→</span>
                    </Button>
                    {step > 0 && (
                      <button
                        type="button"
                        className="text-sm text-folia-ink/50 underline-offset-4 transition hover:text-folia-moss hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-folia-moss"
                        onClick={() => setStep((s) => s - 1)}
                      >
                        Back
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          <aside className="order-1 lg:order-2 lg:sticky lg:top-28">
            <div className="relative overflow-hidden rounded-[1.75rem] bg-folia-sand/40 shadow-soft">
              <div className="aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5]">
                <SoftImage
                  src={quizImage}
                  alt="Soft skincare still life with clean bottles"
                  className="h-full w-full"
                  imgClassName="h-full w-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-folia-ink/55 via-folia-ink/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <p className="text-[10px] uppercase tracking-[0.28em] text-folia-cream/70">Consultation</p>
                <p className="mt-2 max-w-xs font-display text-2xl text-folia-cream md:text-3xl">
                  Quiet formulas. Clear matches.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
