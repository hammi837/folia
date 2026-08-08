import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import SectionHeading from "../components/ui/SectionHeading";
import ProductCard from "../components/product/ProductCard";
import Spinner from "../components/ui/Spinner";
import api from "../services/api";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1600&q=80";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get("/products/", { params: { featured: true } });
        if (alive) setFeatured(data.slice(0, 4));
      } catch {
        if (alive) setFeatured([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      <section className="relative min-h-[88vh] overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="FOLIA clean beauty ritual"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-folia-ink/75 via-folia-ink/45 to-folia-ink/15" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-site flex-col justify-end px-4 pb-16 pt-28 md:px-6 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl text-folia-cream"
          >
            <p className="font-display text-4xl tracking-[0.14em] md:text-5xl">FOLIA</p>
            <h1 className="mt-5 font-display text-4xl leading-tight text-balance md:text-6xl">
              Skin rituals, distilled.
            </h1>
            <p className="mt-5 max-w-md text-base text-folia-cream/80 md:text-lg">
              Minimal formulas. Honest ingredients. A calmer way to shop clean beauty.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/shop" variant="light">
                Shop all
              </Button>
              <Button to="/quiz" variant="secondary" className="border-folia-cream/40 text-folia-cream hover:border-folia-cream hover:text-folia-cream">
                Take the quiz
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-site px-4 py-20 md:px-6">
        <SectionHeading
          eyebrow="Ritual picks"
          title="Bestsellers for a quieter routine"
          subtitle="A tight edit of cleansers, serums, and seals — built for daily calm, not shelf clutter."
        />
        <div className="mt-12">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
        <div className="mt-10">
          <Button to="/shop" variant="secondary">
            View full catalogue
          </Button>
        </div>
      </section>

      <section className="border-y border-folia-sand/80 bg-folia-mist/50">
        <div className="mx-auto grid max-w-site gap-10 px-4 py-20 md:grid-cols-2 md:px-6 md:items-center">
          <div>
            <Badge>Ingredient honesty</Badge>
            <h2 className="mt-4 font-display text-3xl md:text-4xl text-balance">
              Botanicals with a clinical conscience
            </h2>
            <p className="mt-4 max-w-md text-folia-ink/65 leading-relaxed">
              Every FOLIA formula leads with what it does — ceramides for barrier days,
              vitamin derivatives for dull mornings, oils only when the seal is needed.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["No fragrance drama", "Unscented options that still feel sensorial."],
              ["Barrier first", "Ceramides, panthenol, and calm textures."],
              ["Short lists", "Fewer actives, clearer results timelines."],
              ["Quiz-led", "Recommendations matched to skin, not trends."],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-2xl bg-folia-cream/80 p-5">
                <h3 className="font-display text-lg">{title}</h3>
                <p className="mt-2 text-sm text-folia-ink/60">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-site px-4 py-20 md:px-6">
        <div className="overflow-hidden rounded-[2rem] bg-folia-moss px-8 py-14 text-folia-cream md:px-14">
          <p className="text-xs uppercase tracking-[0.22em] text-folia-cream/70">Skin quiz</p>
          <h2 className="mt-4 max-w-xl font-display text-3xl md:text-5xl text-balance">
            Not sure where to start? Let the ritual find you.
          </h2>
          <p className="mt-4 max-w-lg text-folia-cream/75">
            Four quiet questions. A short edit of products matched to your skin type and concern.
          </p>
          <div className="mt-8">
            <Button to="/quiz" variant="light">
              Start the quiz
            </Button>
          </div>
        </div>
      </section>

      <section className="pb-8 text-center text-sm text-folia-ink/50">
        Free shipping over $65 · 30-day calm guarantee · Clean formulas only
      </section>
    </div>
  );
}
