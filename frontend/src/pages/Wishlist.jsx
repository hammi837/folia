import { useEffect, useState } from "react";
import api from "../services/api";
import ProductCard from "../components/product/ProductCard";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import { useWishlistStore } from "../store/wishlistStore";

export default function Wishlist() {
  const ids = useWishlistStore((s) => s.ids);
  const toggle = useWishlistStore((s) => s.toggle);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!ids.length) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data } = await api.get("/products/");
        if (alive) setProducts(data.filter((p) => ids.includes(p.id)));
      } catch {
        if (alive) setProducts([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [ids]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (!products.length) {
    return (
      <EmptyState
        title="Wishlist is empty"
        description="Save products from any product page."
        actionLabel="Browse shop"
        actionTo="/shop"
      />
    );
  }

  return (
    <section className="mx-auto max-w-site px-4 py-12 md:px-6">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-display text-4xl">Wishlist</h1>
        <Button to="/shop" variant="secondary">
          Shop more
        </Button>
      </div>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div key={product.id}>
            <ProductCard product={product} />
            <button
              type="button"
              className="mt-3 text-sm text-folia-ink/50 hover:text-folia-moss"
              onClick={() => toggle(product.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
