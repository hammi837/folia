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

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/checkout/", {
        ...form,
        items: items.map((i) => ({
          product_id: i.productId,
          quantity: i.quantity,
          variant_id: i.variantId,
        })),
      });
      clear();
      if (data.mock_paid) {
        showToast("Order placed (test mode)");
      } else {
        showToast("Payment intent created");
      }
      navigate(user ? "/orders" : "/");
    } catch (err) {
      showToast(err.response?.data?.detail || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-site px-4 py-12 md:px-6">
      <h1 className="font-display text-4xl">Checkout</h1>
      <p className="mt-2 text-sm text-folia-ink/55">
        Stripe test mode — without real keys, orders are marked paid automatically.
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
          <div className="mt-4 flex justify-between border-t border-folia-sand pt-4 font-medium">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
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
