import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import api from "../services/api";
import ProductCard from "../components/product/ProductCard";
import CategoryCard from "../components/home/CategoryCard";
import SectionHeading from "../components/ui/SectionHeading";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const CONCERNS = ["barrier", "hydration", "dullness", "acne", "aging", "redness"];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [concern, setConcern] = useState("");
  const [q, setQ] = useState("");
  const reduced = usePrefersReducedMotion();
  const category = searchParams.get("category") || "";

  const setCategory = (slug) => {
    const next = new URLSearchParams(searchParams);
    if (slug) next.set("category", slug);
    else next.delete("category");
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    api.get("/categories/").then((res) => setCategories(res.data)).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (concern) params.concern = concern;
    if (q.trim()) params.q = q.trim();
    api
      .get("/products/", { params })
      .then((res) => {
        if (alive) setProducts(res.data);
      })
      .catch(() => {
        if (alive) setProducts([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [category, concern, q]);

  const countLabel = useMemo(
    () => `${products.length} product${products.length === 1 ? "" : "s"}`,
    [products.length]
  );

  return (
    <div>
      <section className="relative overflow-hidden border-b border-folia-sand/70 bg-folia-mist/40">
        <div className="mx-auto max-w-site px-4 py-16 md:px-6 md:py-20">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <SectionHeading
              eyebrow="Catalogue"
              title="Shop the ritual"
              subtitle="Start with a collection card, then refine by concern. This is editorial commerce — not a warehouse grid."
            />
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat, index) => (
              <CategoryCard key={cat.id} category={cat} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-site px-4 py-12 md:px-6">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1 space-y-6">
              <FilterGroup
                label="Collection"
                hint="Product type — cleansers, serums, oils, and more"
              >
                <FilterChip active={!category} onClick={() => setCategory("")}>
                  All
                </FilterChip>
                {categories.map((c) => (
                  <FilterChip
                    key={c.id}
                    active={category === c.slug}
                    onClick={() => setCategory(c.slug)}
                  >
                    {c.name}
                  </FilterChip>
                ))}
              </FilterGroup>

              <FilterGroup
                label="Skin concern"
                hint="What your skin needs help with right now"
              >
                {CONCERNS.map((c) => (
                  <FilterChip
                    key={c}
                    active={concern === c}
                    onClick={() => setConcern(concern === c ? "" : c)}
                  >
                    {c}
                  </FilterChip>
                ))}
              </FilterGroup>
            </div>

            <label className="block w-full shrink-0 lg:max-w-xs lg:pt-6">
              <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-folia-ink/45">
                Search
              </span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products"
                className="w-full rounded-full border border-folia-sand bg-white/60 px-4 py-2.5 text-sm outline-none focus:border-folia-moss"
              />
            </label>
          </div>

          <p className="text-sm text-folia-ink/50">
            {countLabel}
            {category || concern
              ? ` · filtered by ${[
                  category && categories.find((c) => c.slug === category)?.name,
                  concern && `${concern} concern`,
                ]
                  .filter(Boolean)
                  .join(" + ")}`
              : ""}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Spinner />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title="No matches"
            description="Try another category or clear your filters."
            actionLabel="Reset"
            actionTo="/shop"
          />
        ) : (
          <motion.div layout className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  );
}

function FilterGroup({ label, hint, children }) {
  return (
    <div>
      <div className="mb-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-folia-ink/45">{label}</p>
        <p className="mt-1 text-sm text-folia-ink/50">{hint}</p>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({ children, active, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition ${
        active
          ? "bg-folia-moss text-folia-cream"
          : "border border-folia-sand bg-white/40 text-folia-ink/70 hover:border-folia-moss"
      }`}
    >
      {children}
    </motion.button>
  );
}
