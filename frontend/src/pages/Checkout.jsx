import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import EmptyState from "../components/ui/EmptyState";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";

export default function Checkout() {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const subtotal = useCartStore((s) => s.subtotal());
  const user = useAuthStore((s) => s.user);
  const showToast = useUiStore((s) => s.showToast);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState(null);
  const [form, setForm] = useState({
    email: user?.email || "",
    shipping_name: user?.full_name || "",
    shipping_address: "",
    shipping_city: "",
    shipping_country: "United States",
    shipping_postal: "",
  });

  if (!items.length) {
    return (
      <EmptyState
        title="Nothing to checkout"
        description="Add a few rituals to your bag first."
        actionLabel="Shop"
        actionTo="/shop"
      />
    );
  }

  const discount = promo?.valid ? Number(promo.discount_amount) : 0;
  const total = Math.max(subtotal - discount, 0);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const applyPromo = async () => {
    try {
      const { data } = await api.post("/promos/validate", {
        code: promoInput,
        subtotal,
      });
      if (!data.valid) {
        setPromo(null);
        showToast(data.message || "Invalid code");
        return;
      }
      setPromo(data);
      showToast(`Promo ${data.code} applied`);
    } catch {
      showToast("Could not validate promo");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/checkout/", {
        ...form,
        promo_code: promo?.valid ? promo.code : null,
        items: items.map((i) => ({
          product_id: i.productId,
          quantity: i.quantity,
          variant_id: i.variantId,
        })),
      });
      clear();
      showToast(data.mock_paid ? "Order placed (test mode)" : "Payment intent created");
      navigate("/order-complete", { state: { order: data.order } });
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(typeof detail === "string" ? detail : "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-site px-4 py-12 md:px-6">
      <h1 className="font-display text-4xl">Checkout</h1>
      <p className="mt-2 text-sm text-folia-ink/55">
        Try promo <span className="font-medium text-folia-moss">FOLIA10</span> (10% off, min $40).
      </p>

      <form onSubmit={onSubmit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Input label="Email" name="email" type="email" required value={form.email} onChange={onChange} />
          <Input label="Full name" name="shipping_name" required value={form.shipping_name} onChange={onChange} />
          <Input label="Address" name="shipping_address" required value={form.shipping_address} onChange={onChange} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="City" name="shipping_city" required value={form.shipping_city} onChange={onChange} />
            <Input label="Postal code" name="shipping_postal" required value={form.shipping_postal} onChange={onChange} />
          </div>
          <Input label="Country" name="shipping_country" required value={form.shipping_country} onChange={onChange} />
        </div>

        <aside className="h-fit rounded-2xl border border-folia-sand bg-white/40 p-6">
          <h2 className="font-display text-xl">Order summary</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((i) => (
              <li key={i.key} className="flex justify-between gap-3">
                <span className="text-folia-ink/70">
                  {i.name} × {i.quantity}
                </span>
                <span>${(i.price * i.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex gap-2">
            <input
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="Promo code"
              className="w-full rounded-full border border-folia-sand bg-white/70 px-4 py-2 text-sm outline-none focus:border-folia-moss"
            />
            <Button type="button" variant="secondary" size="sm" onClick={applyPromo}>
              Apply
            </Button>
          </div>

          <div className="mt-4 space-y-2 border-t border-folia-sand pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-folia-ink/60">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-folia-moss">
                <span>Discount ({promo.code})</span>
                <span>−${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <Button type="submit" className="mt-6 w-full" disabled={loading}>
            {loading ? "Placing order…" : "Place order"}
          </Button>
          <Link to="/cart" className="mt-3 block text-center text-sm text-folia-ink/50 hover:text-folia-moss">
            Back to bag
          </Link>
        </aside>
      </form>
    </section>
  );
}
