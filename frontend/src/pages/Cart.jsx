import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { useCartStore } from "../store/cartStore";
import { mediaUrl } from "../lib/mediaUrl";

export default function Cart() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());

  if (!items.length) {
    return (
      <EmptyState
        title="Your bag is empty"
        description="Start with a cleanser, serum, or take the skin quiz."
        actionLabel="Shop all"
        actionTo="/shop"
      />
    );
  }

  return (
    <section className="mx-auto max-w-site px-4 py-12 md:px-6">
      <h1 className="font-display text-4xl">Your bag</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-6">
          {items.map((item) => (
            <li key={item.key} className="flex gap-4 border-b border-folia-sand/70 pb-6">
              <Link to={`/product/${item.slug}`} className="h-28 w-24 overflow-hidden bg-folia-sand/40">
                {item.image && (
                  <img src={mediaUrl(item.image)} alt="" className="h-full w-full object-cover" />
                )}
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link to={`/product/${item.slug}`} className="font-display text-xl hover:text-folia-moss">
                      {item.name}
                    </Link>
                    {item.variantName && (
                      <p className="text-sm text-folia-ink/50">{item.variantName}</p>
                    )}
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full border border-folia-sand">
                    <button type="button" className="px-3 py-1" onClick={() => setQuantity(item.key, item.quantity - 1)}>
                      −
                    </button>
                    <span className="px-2 text-sm">{item.quantity}</span>
                    <button type="button" className="px-3 py-1" onClick={() => setQuantity(item.key, item.quantity + 1)}>
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-folia-ink/50 hover:text-folia-moss"
                    onClick={() => removeItem(item.key)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border border-folia-sand bg-white/40 p-6">
          <div className="flex justify-between text-sm">
            <span className="text-folia-ink/60">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <p className="mt-3 text-xs text-folia-ink/50">Shipping calculated at checkout. Free over $65.</p>
          <Button to="/checkout" className="mt-6 w-full">
            Checkout
          </Button>
          <Button to="/shop" variant="ghost" className="mt-2 w-full">
            Continue shopping
          </Button>
        </aside>
      </div>
    </section>
  );
}
