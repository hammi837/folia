import { useCallback, useEffect, useRef, useState } from "react";
import api from "../../services/api";
import { asArray } from "../../lib/asArray";
import CategoryCard from "./CategoryCard";
import SectionHeading from "../ui/SectionHeading";
import Spinner from "../ui/Spinner";

function ArrowButton({ direction, onClick, disabled }) {
  return (
    <button
      type="button"
      aria-label={direction === "prev" ? "Previous collections" : "Next collections"}
      onClick={onClick}
      disabled={disabled}
      className={`absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-folia-ink/10 bg-folia-ink text-folia-cream shadow-soft transition hover:bg-folia-moss disabled:cursor-not-allowed disabled:border-folia-ink/15 disabled:bg-folia-ink/35 disabled:text-folia-cream ${
        direction === "prev" ? "left-0" : "right-0"
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {direction === "prev" ? (
          <path
            d="M15 6L9 12l6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M9 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}

export default function CategoryShowcase() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const trackRef = useRef(null);

  useEffect(() => {
    let alive = true;
    api
      .get("/categories/")
      .then((res) => {
        if (alive) setCategories(asArray(res.data));
      })
      .catch(() => {
        if (alive) setCategories([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const updateArrows = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setCanPrev(track.scrollLeft > 4);
    setCanNext(max > 4 && track.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || loading) return;
    updateArrows();
    track.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      track.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [loading, categories, updateArrows]);

  const scrollByCard = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("[data-carousel-card]");
    if (!card) return;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "20") || 20;
    const step = card.getBoundingClientRect().width + gap;
    track.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-site px-4 py-24 md:px-6">
      <SectionHeading
        eyebrow="Collections"
        title="Shop by ritual chapter"
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="relative mt-14 px-12 sm:px-14">
          <ArrowButton direction="prev" disabled={!canPrev} onClick={() => scrollByCard(-1)} />
          <ArrowButton direction="next" disabled={!canNext} onClick={() => scrollByCard(1)} />

          <div
            ref={trackRef}
            className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth"
          >
            {categories.map((cat, index) => (
              <div
                key={cat.id}
                data-carousel-card
                className="w-full shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3.75rem)/4)]"
              >
                <CategoryCard category={cat} index={index} />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
