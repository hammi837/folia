import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import Button from "../components/ui/Button";
import SoftImage from "../components/ui/SoftImage";
import ContentCardView, { contentCardSpanClass } from "../components/ui/ContentCardView";
import api from "../services/api";
import { asArray } from "../lib/asArray";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const FALLBACK_PILLARS = [
  {
    title: "Honest ingredients",
    body: "Every formula lists what it does and why it’s there — no foggy complexes, no filler claims.",
  },
  {
    title: "Barrier-first care",
    body: "Comfort first, actives second. Rituals that restore instead of strip.",
  },
  {
    title: "Quiet packaging",
    body: "Recyclable materials, soft finishes, and labels you can actually read.",
  },
];

const FALLBACK_RITUAL = [
  { title: "Cleanse", body: "Rinse the day. Keep the barrier." },
  { title: "Treat", body: "One serum. One concern. Done." },
  { title: "Seal", body: "Cream or oil to lock the calm in." },
];

const ease = [0.22, 1, 0.36, 1];

function FoliaSeal({ className = "", size = "md" }) {
  const isSm = size === "sm";
  return (
    <>
      <div
        className={`pointer-events-none absolute z-[5] rounded-full bg-folia-ink/75 blur-3xl ${
          isSm ? "h-32 w-32 md:h-40 md:w-40" : "h-44 w-44 md:h-56 md:w-56"
        } ${className}`}
        aria-hidden="true"
      />
      <div
        className={`pointer-events-none absolute z-[6] flex items-center justify-center rounded-full border border-folia-cream/25 bg-folia-ink/70 shadow-soft backdrop-blur-sm ${
          isSm ? "h-14 w-14 md:h-16 md:w-16" : "h-20 w-20 md:h-28 md:w-28"
        } ${className}`}
        aria-hidden="true"
      >
        <div
          className={`flex flex-col items-center justify-center rounded-full border border-folia-cream/35 ${
            isSm ? "h-11 w-11 md:h-14 md:w-14" : "h-16 w-16 md:h-[5.5rem] md:w-[5.5rem]"
          }`}
        >
          <span
            className={`font-display tracking-[0.28em] text-folia-cream ${
              isSm ? "text-[8px] md:text-[10px]" : "text-[11px] md:text-sm"
            }`}
          >
            FOLIA
          </span>
          <span
            className={`mt-0.5 uppercase tracking-[0.18em] text-folia-cream/55 ${
              isSm ? "text-[6px] md:text-[7px]" : "text-[7px] md:text-[8px]"
            }`}
          >
            est. ritual
          </span>
        </div>
      </div>
    </>
  );
}

function FadeIn({ children, reduced, className = "", delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.75, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

export default function About() {
  const reduced = usePrefersReducedMotion();
  const location = useLocation();
  const heroRef = useRef(null);
  const [images, setImages] = useState({
    hero: null,
    story: null,
    ritual: null,
  });
  const [pillars, setPillars] = useState(FALLBACK_PILLARS);
  const [ritual, setRitual] = useState(FALLBACK_RITUAL);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", reduced ? "0%" : "18%"]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 1.08]);

  useEffect(() => {
    document.title = "About Us · FOLIA";
    return () => {
      document.title = "FOLIA — Clean Beauty";
    };
  }, []);

  useEffect(() => {
    Promise.all([
      api.get("/settings/").catch(() => ({ data: {} })),
      api.get("/content-cards/", { params: { page_key: "about_pillars" } }).catch(() => ({ data: [] })),
      api.get("/content-cards/", { params: { page_key: "about_ritual" } }).catch(() => ({ data: [] })),
    ]).then(([settingsRes, pillarsRes, ritualRes]) => {
      setImages({
        hero: settingsRes.data.about_hero_image_url || null,
        story: settingsRes.data.about_story_image_url || null,
        ritual: settingsRes.data.about_ritual_image_url || null,
      });
      if (asArray(pillarsRes.data).length) setPillars(asArray(pillarsRes.data));
      if (asArray(ritualRes.data).length) setRitual(asArray(ritualRes.data));
    });
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }, [location.hash]);

  return (
    <div className="overflow-x-hidden">
      {/* Full-bleed cinematic hero */}
      <section ref={heroRef} className="relative min-h-[92vh] overflow-hidden bg-folia-ink">
        <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0">
          <SoftImage
            src={images.hero}
            alt=""
            className="h-full w-full"
            imgClassName="h-full w-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-folia-ink via-folia-ink/55 to-folia-ink/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-folia-ink/70 via-transparent to-transparent" />

        <div className="relative mx-auto flex min-h-[92vh] max-w-site flex-col justify-end px-4 pb-16 pt-28 md:px-6 md:pb-20">
          <motion.p
            className="font-display text-5xl tracking-[0.16em] text-folia-cream md:text-7xl"
            initial={reduced ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease }}
          >
            FOLIA
          </motion.p>

          <div className="mt-6 max-w-3xl overflow-hidden">
            <motion.h1
              className="font-display text-4xl leading-[1.05] text-folia-cream text-balance md:text-6xl lg:text-7xl"
              initial={reduced ? false : { y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 1, delay: 0.15, ease }}
            >
              Beauty without the noise.
            </motion.h1>
          </div>

          <motion.p
            className="mt-6 max-w-md text-base text-folia-cream/75 md:text-lg"
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease }}
          >
            A clean-beauty house for fewer formulas, clearer rituals, and skin that feels like
            itself.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center gap-6"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.6 }}
          >
            <Button to="/quiz" variant="light">
              Find your ritual
            </Button>
            <a
              href="#story"
              className="text-xs uppercase tracking-[0.22em] text-folia-cream/70 transition hover:text-folia-cream"
            >
              Our story ↓
            </a>
          </motion.div>
        </div>

        <p className="pointer-events-none absolute bottom-6 right-6 hidden text-[10px] uppercase tracking-[0.28em] text-folia-cream/45 md:block">
          Est. for calm skin
        </p>
      </section>

      {/* Giant manifesto line */}
      <section className="relative overflow-hidden bg-folia-cream py-16 md:py-24">
        <div className="mx-auto max-w-site px-4 md:px-6">
          <FadeIn reduced={reduced}>
            <p className="max-w-5xl font-display text-3xl leading-tight text-folia-ink text-balance md:text-5xl lg:text-6xl">
              We edit skincare the way a good ritual should feel —{" "}
              <span className="italic text-folia-moss">slow, honest, and enough.</span>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Story + image split */}
      <section id="story" className="scroll-mt-24 bg-folia-ink text-folia-cream">
        <div className="grid lg:grid-cols-2">
          <div className="relative min-h-[50vh] overflow-hidden lg:min-h-[85vh]">
            <SoftImage
              src={images.story}
              alt="Evening oil ritual"
              className="absolute inset-0 h-full w-full"
              imgClassName="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-folia-ink/20" />
            <FoliaSeal size="sm" className="bottom-5 right-2 md:bottom-7 md:right-3" />
          </div>
          <div className="flex flex-col justify-center px-6 py-16 md:px-12 lg:px-16 lg:py-24">
            <FadeIn reduced={reduced}>
              <p className="text-[11px] uppercase tracking-[0.28em] text-folia-cream/50">Chapter 01</p>
              <h2 className="mt-4 font-display text-4xl md:text-5xl">Why we exist</h2>
              <div className="mt-8 space-y-5 text-base leading-relaxed text-folia-cream/70 md:text-lg">
                <p>
                  Shopping for skincare felt loud — endless claims, crowded kits, and little quiet
                  guidance. FOLIA began as a response: short lists, barrier-aware textures, and a
                  store that helps you choose instead of overwhelm.
                </p>
                <p>
                  Every product is a chapter — cleanse, treat, seal — so your shelf stays light and
                  your routine stays keepable.
                </p>
              </div>
              <ul className="mt-10 space-y-3 border-t border-folia-cream/15 pt-8 text-sm text-folia-cream/80">
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-folia-blush" />
                  Cruelty-free development
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-folia-blush" />
                  Transparent actives & why they matter
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-folia-blush" />
                  30-day calm guarantee
                </li>
              </ul>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Pillars — oversized numbered rows */}
      <section className="bg-folia-cream">
        <div className="mx-auto max-w-site px-4 py-20 md:px-6 md:py-28">
          <FadeIn reduced={reduced}>
            <p className="text-[11px] uppercase tracking-[0.28em] text-folia-moss">Chapter 02</p>
            <h2 className="mt-4 max-w-2xl font-display text-4xl md:text-5xl">What we stand for</h2>
          </FadeIn>

          <div className="mt-14 space-y-5">
            {pillars.map((item, i) => {
              const layout = item.layout || "text";
              const hasMedia = layout !== "text" && item.image_url;
              if (hasMedia) {
                return (
                  <ContentCardView
                    key={item.id || item.title}
                    card={item}
                    index={i}
                    reduced={reduced}
                    className="w-full"
                  />
                );
              }
              return (
                <motion.div
                  key={item.id || item.title}
                  className="group grid gap-4 border-t border-folia-sand py-10 md:grid-cols-[7rem_1fr_1.2fr] md:items-end md:gap-10 md:py-14"
                  initial={reduced ? false : { opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.7, delay: i * 0.08, ease }}
                >
                  <p className="font-display text-5xl text-folia-moss/25 transition group-hover:text-folia-moss/50 md:text-6xl">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="font-display text-3xl md:text-4xl">{item.title}</h3>
                  <p className="max-w-md text-sm leading-relaxed text-folia-ink/60 md:text-base md:justify-self-end">
                    {item.body || item.copy}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ritual band */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <SoftImage
            src={images.ritual}
            alt=""
            className="h-full w-full"
            imgClassName="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-folia-ink/75 via-folia-ink/35 to-folia-ink/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-folia-ink/55 via-transparent to-folia-ink/25" />
        </div>

        {/* Soft corner blend + circular seal covering AI watermark */}
        <FoliaSeal className="bottom-10 right-4 md:bottom-14 md:right-6" />
        {/* blur blob sits slightly behind seal */}
        <div
          className="pointer-events-none absolute bottom-2 right-0 z-[4] h-52 w-52 rounded-full bg-folia-ink/80 blur-3xl md:bottom-4 md:h-64 md:w-64"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-site px-4 py-20 md:px-6 md:py-28">
          <FadeIn reduced={reduced}>
            <p className="text-[11px] uppercase tracking-[0.28em] text-folia-cream/55">Chapter 03</p>
            <h2 className="mt-4 max-w-xl font-display text-4xl text-folia-cream md:text-5xl">
              Three steps. That’s the ritual.
            </h2>
          </FadeIn>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {ritual.map((r, i) => {
              const layout = r.layout || "text";
              const hasMedia = layout !== "text" && r.image_url;
              if (hasMedia) {
                return (
                  <ContentCardView
                    key={r.id || r.title}
                    card={r}
                    index={i}
                    reduced={reduced}
                    tone="onDark"
                    className={contentCardSpanClass(r, { cols: 3 })}
                  />
                );
              }
              return (
                <motion.div
                  key={r.id || r.title}
                  initial={reduced ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.65, delay: i * 0.1, ease }}
                  className="pt-2"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-folia-cream/50">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-4 font-display text-3xl text-folia-cream">{r.title}</h3>
                  <p className="mt-3 text-sm text-folia-cream/70">{r.body || r.copy}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-14 flex flex-wrap gap-3">
            <Button to="/quiz" variant="light">
              Take the skin quiz
            </Button>
            <Button to="/shop" variant="secondaryLight">
              Shop the edit
            </Button>
          </div>
        </div>
      </section>

      {/* Marquee-ish word strip */}
      <section className="overflow-hidden border-y border-folia-sand bg-folia-mist/50 py-5" aria-hidden="true">
        <motion.div
          className="flex whitespace-nowrap font-display text-2xl text-folia-ink/25 md:text-3xl"
          animate={reduced ? undefined : { x: ["0%", "-50%"] }}
          transition={reduced ? undefined : { duration: 28, repeat: Infinity, ease: "linear" }}
        >
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex gap-10 px-5">
              <span>Clean formulas</span>
              <span>·</span>
              <span>Barrier calm</span>
              <span>·</span>
              <span>Honest lists</span>
              <span>·</span>
              <span>Quiet packaging</span>
              <span>·</span>
              <span>Daily ritual</span>
              <span>·</span>
            </span>
          ))}
        </motion.div>
      </section>

      {/* Care + contact */}
      <section className="bg-folia-cream">
        <div className="mx-auto grid max-w-site gap-0 px-4 py-20 md:px-6 md:py-28 lg:grid-cols-2 lg:gap-16">
          <FadeIn reduced={reduced}>
            <div id="shipping" className="scroll-mt-24">
              <p className="text-[11px] uppercase tracking-[0.28em] text-folia-moss">Care</p>
              <h2 className="mt-4 font-display text-4xl md:text-5xl">Shipping & returns</h2>
              <ul className="mt-8 space-y-5 text-sm leading-relaxed text-folia-ink/70 md:text-base">
                <li className="border-l-2 border-folia-moss/40 pl-4">
                  <span className="font-medium text-folia-ink">Free shipping</span> on orders over $65
                </li>
                <li className="border-l-2 border-folia-moss/40 pl-4">
                  Most orders leave in 1–2 business days · arrive in 3–7
                </li>
                <li className="border-l-2 border-folia-moss/40 pl-4">
                  <span className="font-medium text-folia-ink">30-day calm guarantee</span> — return or
                  exchange if a formula isn’t right
                </li>
                <li className="border-l-2 border-folia-moss/40 pl-4">
                  Opened products may qualify for store credit
                </li>
              </ul>
            </div>
          </FadeIn>

          <FadeIn reduced={reduced} delay={0.1}>
            <div
              id="contact"
              className="mt-14 scroll-mt-24 rounded-[2rem] bg-folia-moss px-8 py-10 text-folia-cream md:mt-0 md:px-10 md:py-12"
            >
              <p className="text-[11px] uppercase tracking-[0.28em] text-folia-cream/55">Contact</p>
              <h2 className="mt-4 font-display text-3xl md:text-4xl">We’re a small team. We reply with care.</h2>
              <p className="mt-5 text-sm leading-relaxed text-folia-cream/70">
                Ingredients, orders, quiz results — write anytime. Mon–Fri, usually within 24 hours.
              </p>
              <a
                href="mailto:hello@folia.beauty"
                className="mt-8 inline-block font-display text-2xl text-folia-cream underline-offset-4 transition hover:underline md:text-3xl"
              >
                hello@folia.beauty
              </a>
              <div className="mt-10 flex flex-wrap gap-4 text-sm">
                <Link to="/shop" className="text-folia-cream/80 hover:text-folia-cream">
                  Shop →
                </Link>
                <Link to="/quiz" className="text-folia-cream/80 hover:text-folia-cream">
                  Skin quiz →
                </Link>
                <Link to="/" className="text-folia-cream/80 hover:text-folia-cream">
                  Home →
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
