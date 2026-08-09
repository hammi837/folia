import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import SectionHeading from "../components/ui/SectionHeading";
import ProductCard from "../components/product/ProductCard";
import CategoryShowcase from "../components/home/CategoryShowcase";
import SoftImage from "../components/ui/SoftImage";
import ReviewsScroller from "../components/home/ReviewsScroller";
import Spinner from "../components/ui/Spinner";
import ContentCardView, { contentCardSpanClass } from "../components/ui/ContentCardView";
import api from "../services/api";
import { mediaUrl } from "../lib/mediaUrl";
import { asArray } from "../lib/asArray";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const FALLBACK_BRAND = [
  {
    title: "Fewer formulas",
    body: "A short shelf — cleanse, treat, seal — so every bottle earns its place.",
  },
  {
    title: "Barrier first",
    body: "Comfort before intensity. We build for skin that needs calm as much as clarity.",
  },
  {
    title: "Honest lists",
    body: "Every active has a why. No foggy complexes, no filler claims.",
  },
  {
    title: "Quiet packaging",
    body: "Soft finishes, clear labels, materials chosen with care.",
  },
  {
    title: "Quiz-led guidance",
    body: "Not sure where to start? Four calm questions, a personal edit.",
  },
  {
    title: "30-day calm guarantee",
    body: "If a formula isn’t right, we’ll help you exchange or return with ease.",
  },
];

const FALLBACK_HONESTY = [
  { title: "No fragrance drama", body: "Unscented options that still feel sensorial." },
  { title: "Barrier first", body: "Ceramides, panthenol, and calm textures." },
  { title: "Short lists", body: "Fewer actives, clearer results timelines." },
  { title: "Quiz-led", body: "Recommendations matched to skin, not trends." },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [offers, setOffers] = useState([]);
  const [heroImage, setHeroImage] = useState(null);
  const [brandCards, setBrandCards] = useState(FALLBACK_BRAND);
  const [honestyCards, setHonestyCards] = useState(FALLBACK_HONESTY);
  const [loading, setLoading] = useState(true);
  const reduced = usePrefersReducedMotion();
  const introDelay = reduced ? 0 : 0.35;

  useEffect(() => {
    document.title = "Home — FOLIA Clean Beauty";
    return () => {
      document.title = "FOLIA — Clean Beauty";
    };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [productsRes, offersRes, settingsRes, brandRes, honestyRes] = await Promise.all([
          api.get("/products/", { params: { featured: true } }),
          api.get("/promos/offers").catch(() => ({ data: [] })),
          api.get("/settings/").catch(() => ({ data: {} })),
          api.get("/content-cards/", { params: { page_key: "home_brand" } }).catch(() => ({ data: [] })),
          api.get("/content-cards/", { params: { page_key: "home_honesty" } }).catch(() => ({ data: [] })),
        ]);
        if (alive) {
          setFeatured(asArray(productsRes.data).slice(0, 4));
          setOffers(asArray(offersRes.data).slice(0, 2));
          setHeroImage(settingsRes.data?.hero_image_url || null);
          const brand = asArray(brandRes.data);
          const honesty = asArray(honestyRes.data);
          if (brand.length) setBrandCards(brand);
          if (honesty.length) setHonestyCards(honesty);
        }
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
      <section className="relative min-h-[92vh] overflow-hidden bg-folia-ink">
        {heroImage ? (
          <motion.img
            key={heroImage}
            src={mediaUrl(heroImage)}
            alt="FOLIA clean beauty ritual"
            className="absolute inset-0 h-full w-full object-cover"
            initial={reduced ? false : { scale: 1.14 }}
            animate={{ scale: 1 }}
            transition={{ duration: 8, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : (
          <SoftImage src={null} className="absolute inset-0 h-full w-full" placeholderLabel="FOLIA" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-folia-ink/80 via-folia-ink/50 to-folia-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-folia-ink/40 via-transparent to-transparent" />

        <div className="relative mx-auto flex min-h-[92vh] max-w-site flex-col justify-end px-4 pb-16 pt-28 md:px-6 md:pb-24">
          <div className="max-w-xl text-folia-cream">
            <motion.p
              className="font-display text-4xl tracking-[0.14em] md:text-5xl"
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: introDelay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              FOLIA
            </motion.p>

            <div className="mt-5 overflow-hidden">
              <motion.h1
                className="font-display text-4xl leading-tight text-balance md:text-6xl"
                initial={reduced ? false : { y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ delay: introDelay + 0.15, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                Skin rituals, distilled.
              </motion.h1>
            </div>

            <motion.p
              className="mt-5 max-w-md text-base text-folia-cream/80 md:text-lg"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: introDelay + 0.4, duration: 0.7 }}
            >
              Minimal formulas. Honest ingredients. A calmer way to shop clean beauty.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap gap-3"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: introDelay + 0.55, duration: 0.65 }}
            >
              <Button to="/shop" variant="light">
                Shop all
              </Button>
              <Button to="/quiz" variant="secondaryLight">
                Take the quiz
              </Button>
            </motion.div>
          </div>

          <motion.div
            className="absolute bottom-8 right-6 hidden text-[10px] uppercase tracking-[0.3em] text-folia-cream/45 md:block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
          >
            Scroll to explore
          </motion.div>
        </div>
      </section>

      {offers.length > 0 && (
        <section className="bg-folia-cream">
          <div className="mx-auto max-w-site px-4 py-16 md:px-6">
            <SectionHeading eyebrow="Current offers" title="Editorial campaigns" />
            <div
              className={`mt-10 grid gap-6 ${offers.length > 1 ? "md:grid-cols-2" : "grid-cols-1"}`}
            >
              {offers.map((offer) => (
                <Link
                  key={offer.id}
                  to={offer.category_id ? `/shop` : "/shop"}
                  className="group relative overflow-hidden rounded-[1.5rem] border border-folia-sand bg-white shadow-soft"
                >
                  <div
                    className={`overflow-hidden bg-folia-sand/60 ${
                      offers.length === 1 ? "aspect-[21/9] md:aspect-[2.4/1]" : "aspect-[16/10]"
                    }`}
                  >
                    {offer.image_url && (
                      <img
                        src={mediaUrl(offer.image_url)}
                        alt={offer.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-folia-ink/70 via-folia-ink/15 to-transparent" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6 text-folia-cream md:p-8">
                    {offer.badge_text && (
                      <span className="text-[10px] uppercase tracking-[0.22em] text-folia-cream/70">
                        {offer.badge_text}
                      </span>
                    )}
                    <h3
                      className={`mt-2 font-display ${
                        offers.length === 1 ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"
                      }`}
                    >
                      {offer.title}
                    </h3>
                    {offer.description && (
                      <p className="mt-2 max-w-lg text-sm text-folia-cream/75 md:text-base">
                        {offer.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="bg-folia-cream">
        <CategoryShowcase />
      </div>

      <section className="bg-white">
        <div className="mx-auto max-w-site px-4 py-20 md:px-6">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
          >
            <SectionHeading
              eyebrow="Ritual picks"
              title="Bestsellers for a quieter routine"
              subtitle="A tight edit of cleansers, serums, and seals — built for daily calm, not shelf clutter."
            />
          </motion.div>
          <div className="mt-12">
            {loading ? (
              <div className="flex justify-center py-16">
                <Spinner />
              </div>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {featured.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>
          <div className="mt-10">
            <Button to="/shop" variant="secondary">
              View full catalogue
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y border-folia-sand bg-folia-mist">
        <div className="mx-auto grid max-w-site gap-10 px-4 py-24 md:grid-cols-2 md:px-6 md:items-center">
          <motion.div
            initial={reduced ? false : { opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.75 }}
          >
            <Badge>Ingredient honesty</Badge>
            <h2 className="mt-4 font-display text-3xl md:text-4xl text-balance">
              Botanicals with a clinical conscience
            </h2>
            <p className="mt-4 max-w-md text-folia-ink/65 leading-relaxed">
              Every FOLIA formula leads with what it does — ceramides for barrier days,
              vitamin derivatives for dull mornings, oils only when the seal is needed.
            </p>
            <div className="mt-6">
              <Button to="/about" variant="secondary">
                Our story
              </Button>
            </div>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2">
            {honestyCards.map((card, i) => (
              <ContentCardView
                key={card.id || card.title}
                card={card}
                index={i}
                reduced={reduced}
                showIndex={false}
                className={contentCardSpanClass(card, { cols: 2 })}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-folia-cream">
        <div className="mx-auto max-w-site px-4 py-20 md:px-6">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >
            <SectionHeading
              eyebrow="The FOLIA way"
              title="What our brand stands for"
              subtitle="Quiet promises behind every ritual chapter."
            />
          </motion.div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {brandCards.map((card, i) => (
              <ContentCardView
                key={card.id || card.title}
                card={card}
                index={i}
                reduced={reduced}
                className={contentCardSpanClass(card, { cols: 3 })}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-folia-cream">
        <div className="mx-auto max-w-site px-4 py-20 md:px-6">
          <motion.div
            className="overflow-hidden rounded-[2rem] bg-folia-moss px-8 py-14 text-folia-cream md:px-14"
            initial={reduced ? false : { opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs uppercase tracking-[0.22em] text-folia-cream/70">Skin quiz</p>
            <h2 className="mt-4 max-w-xl font-display text-3xl md:text-5xl text-balance">
              Not sure where to start? Let the ritual find you.
            </h2>
            <p className="mt-4 max-w-lg text-folia-cream/75">
              Answer a few quick questions for a short edit matched to your skin type and concern.
            </p>
            <div className="mt-8">
              <Button to="/quiz" variant="light">
                Start the quiz
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <ReviewsScroller />
    </div>
  );
}
