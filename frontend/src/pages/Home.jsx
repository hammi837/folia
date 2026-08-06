import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <p className="text-sm uppercase tracking-[0.2em] text-folia-moss">Clean Beauty</p>
      <h1 className="mt-4 max-w-2xl font-display text-5xl leading-tight md:text-6xl">
        Skin rituals, distilled.
      </h1>
      <p className="mt-6 max-w-md text-folia-ink/70">
        Minimal formulas. Honest ingredients. A storefront built for calm shopping.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          to="/shop"
          className="rounded-full bg-folia-ink px-6 py-3 text-sm text-folia-cream"
        >
          Shop all
        </Link>
        <Link
          to="/quiz"
          className="rounded-full border border-folia-ink/20 px-6 py-3 text-sm"
        >
          Take the quiz
        </Link>
      </div>
    </section>
  );
}
