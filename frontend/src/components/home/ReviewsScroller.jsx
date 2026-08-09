import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import { asArray } from "../../lib/asArray";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import SectionHeading from "../ui/SectionHeading";
import Spinner from "../ui/Spinner";

function Stars({ rating }) {
  return (
    <span className="text-folia-moss" aria-label={`${rating} out of 5`}>
      {"★".repeat(rating)}
      <span className="text-folia-sand">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default function ReviewsScroller() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    api
      .get("/reviews/", { params: { limit: 16 } })
      .then((r) => setReviews(asArray(r.data)))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const scrollByCard = useCallback((dir) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("[data-review-card]");
    const step = card ? card.getBoundingClientRect().width + 20 : 320;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (reduced || reviews.length < 2) return;
    const id = setInterval(() => scrollByCard(1), 4500);
    return () => clearInterval(id);
  }, [reduced, reviews.length, scrollByCard]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!reviews.length) return null;

  return (
    <section className="overflow-hidden border-t border-folia-sand bg-folia-mist py-20 md:py-24">
      <div className="mx-auto max-w-site px-4 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Community"
            title="What people say about FOLIA"
            subtitle="Product notes and first impressions from the ritual community."
          />
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous reviews"
              onClick={() => scrollByCard(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-folia-ink text-folia-cream transition hover:bg-folia-moss"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next reviews"
              onClick={() => scrollByCard(1)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-folia-ink text-folia-cream transition hover:bg-folia-moss"
            >
              ›
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="scrollbar-none mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2"
        >
          {reviews.map((r, i) => (
            <motion.article
              key={r.id}
              data-review-card
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.04, 0.2) }}
              className="w-[min(100%,20rem)] shrink-0 snap-start rounded-[1.5rem] border border-folia-sand bg-white p-6 shadow-soft sm:w-[22rem]"
            >
              <div className="flex items-center justify-between gap-3 text-sm">
                <Stars rating={r.rating} />
                <span className="text-[10px] uppercase tracking-[0.16em] text-folia-ink/40">
                  {r.review_type === "brand" ? "Brand" : "Product"}
                </span>
              </div>
              {r.title && <h3 className="mt-4 font-display text-xl leading-snug">{r.title}</h3>}
              {r.body && <p className="mt-3 text-sm leading-relaxed text-folia-ink/65">{r.body}</p>}
              <div className="mt-6 border-t border-folia-sand/70 pt-4 text-sm text-folia-ink/50">
                <p className="font-medium text-folia-ink/70">{r.user_name || "FOLIA guest"}</p>
                {r.product_name && <p className="mt-0.5 text-xs">on {r.product_name}</p>}
                {r.discovery_source && (
                  <p className="mt-0.5 text-xs">Found us via {r.discovery_source}</p>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
