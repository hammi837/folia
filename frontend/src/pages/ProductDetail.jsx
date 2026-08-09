import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";
import { useUiStore } from "../store/uiStore";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [variant, setVariant] = useState(null);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUiStore((s) => s.openCart);
  const showToast = useUiStore((s) => s.showToast);
  const wishlistIds = useWishlistStore((s) => s.ids);
  const toggleWish = useWishlistStore((s) => s.toggle);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .get(`/products/${slug}`)
      .then((res) => {
        if (!alive) return;
        setProduct(res.data);
        setVariant(res.data.variants?.[0] || null);
        setActiveImage(0);
      })
      .catch(() => {
        if (alive) setProduct(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <Spinner />
      </div>
    );
  }

  if (!product) {
    return (
      <EmptyState
        title="Product not found"
        description="This ritual may have moved."
        actionLabel="Back to shop"
        actionTo="/shop"
      />
    );
  }

  const images = product.images?.length ? product.images : [];
  const wished = wishlistIds.includes(product.id);

  const onAdd = () => {
    const priced = {
      ...product,
      price: Number(product.sale_price ?? product.price),
    };
    addItem(priced, 1, variant);
    showToast("Added to bag");
    openCart();
  };

  return (
    <section className="mx-auto max-w-site px-4 py-10 md:px-6 md:py-14">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-[4/5] overflow-hidden bg-folia-sand/40">
            {images[activeImage] ? (
              <img
                src={images[activeImage].url}
                alt={images[activeImage].alt || product.name}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={`h-20 w-16 overflow-hidden border ${
                    idx === activeImage ? "border-folia-moss" : "border-transparent"
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.category && <Badge>{product.category.name}</Badge>}
          <h1 className="mt-4 font-display text-4xl md:text-5xl">{product.name}</h1>
          <p className="mt-3 text-folia-ink/65">{product.short_description}</p>
          <p className="mt-5 text-xl font-medium">
            {product.applied_discount_percent ? (
              <>
                <span className="mr-2 text-base text-folia-ink/40 line-through">
                  ${Number(product.price).toFixed(2)}
                </span>
                ${Number(product.sale_price ?? product.price).toFixed(2)}
                <span className="ml-2 text-sm text-folia-moss">
                  −{Number(product.applied_discount_percent)}%
                </span>
              </>
            ) : (
              <>${Number(product.price).toFixed(2)}</>
            )}
          </p>

          {product.variants?.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.16em] text-folia-ink/50">Size</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVariant(v)}
                    className={`rounded-full px-4 py-2 text-sm ${
                      variant?.id === v.id
                        ? "bg-folia-moss text-folia-cream"
                        : "border border-folia-sand"
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={onAdd}>Add to bag</Button>
            <Button variant="secondary" onClick={() => toggleWish(product.id)}>
              {wished ? "Saved" : "Wishlist"}
            </Button>
          </div>

          <p className="mt-8 leading-relaxed text-folia-ink/70">{product.description}</p>

          {product.ingredients?.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-2xl">Ingredient notes</h2>
              <ul className="mt-4 space-y-3">
                {product.ingredients.map((ing) => (
                  <li key={ing.name} className="border-b border-folia-sand/70 pb-3">
                    <p className="font-medium">{ing.name}</p>
                    <p className="text-sm text-folia-ink/60">{ing.why}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.results_timeline?.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-2xl">Results timeline</h2>
              <ol className="mt-4 space-y-4">
                {product.results_timeline.map((step) => (
                  <li key={step.week} className="flex gap-4">
                    <span className="w-20 shrink-0 text-xs font-medium uppercase tracking-[0.14em] text-folia-moss">
                      {step.week}
                    </span>
                    <span className="text-sm text-folia-ink/70">{step.note}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {product.reviews?.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-2xl">Reviews</h2>
              <ul className="mt-4 space-y-4">
                {product.reviews.map((r) => (
                  <li key={r.id} className="rounded-2xl bg-folia-mist/60 p-4">
                    <p className="text-sm font-medium">
                      {"★".repeat(r.rating)}
                      <span className="ml-2 text-folia-ink/50">{r.user_name || "Guest"}</span>
                    </p>
                    {r.title && <p className="mt-1 font-display text-lg">{r.title}</p>}
                    {r.body && <p className="mt-1 text-sm text-folia-ink/65">{r.body}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-folia-sand bg-folia-cream/95 p-4 backdrop-blur md:hidden">
        <Button className="w-full" onClick={onAdd}>
          Add to bag · ${Number(product.sale_price ?? product.price).toFixed(2)}
        </Button>
      </div>
    </section>
  );
}
