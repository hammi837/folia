import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/product/ProductCard";
import SectionHeading from "../components/ui/SectionHeading";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";

const CONCERNS = ["barrier", "hydration", "dullness", "acne", "aging", "redness"];

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [concern, setConcern] = useState("");
  const [q, setQ] = useState("");

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

  const countLabel = useMemo(() => `${products.length} product${products.length === 1 ? "" : "s"}`, [products.length]);

  return (
    <section className="mx-auto max-w-site px-4 py-12 md:px-6">
      <SectionHeading
        eyebrow="Catalogue"
        title="Shop the ritual"
        subtitle="Filter by category or skin concern. Every formula keeps the ingredient story close."
      />

      <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip active={!category} onClick={() => setCategory("")}>
            All
          </FilterChip>
          {categories.map((c) => (
            <FilterChip key={c.id} active={category === c.slug} onClick={() => setCategory(c.slug)}>
              {c.name}
            </FilterChip>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products"
          className="w-full rounded-full border border-folia-sand bg-white/60 px-4 py-2.5 text-sm outline-none focus:border-folia-moss lg:max-w-xs"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {CONCERNS.map((c) => (
          <FilterChip key={c} active={concern === c} onClick={() => setConcern(concern === c ? "" : c)}>
            {c}
          </FilterChip>
        ))}
      </div>

      <p className="mt-6 text-sm text-folia-ink/50">{countLabel}</p>

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
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

function FilterChip({ children, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] transition ${
        active
          ? "bg-folia-moss text-folia-cream"
          : "border border-folia-sand bg-white/40 text-folia-ink/70 hover:border-folia-moss"
      }`}
    >
      {children}
    </button>
  );
}
