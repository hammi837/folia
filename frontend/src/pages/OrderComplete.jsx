import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";

const SOURCES = [
  "Instagram / social",
  "A friend recommended",
  "Google search",
  "Skin quiz",
  "Other",
];

export default function OrderComplete() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const showToast = useUiStore((s) => s.showToast);

  const order = location.state?.order;
  const items = useMemo(() => {
    const raw = order?.items || location.state?.items || [];
    const seen = new Set();
    return raw.filter((i) => {
      const id = i.product_id ?? i.productId;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [order, location.state]);

  const [path, setPath] = useState(null); // "returning" | "new"
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [productId, setProductId] = useState(items[0]?.product_id || items[0]?.productId || "");
  const [guestName, setGuestName] = useState(order?.shipping_name || user?.full_name || "");
  const [source, setSource] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!order && !items.length) {
    return (
      <section className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Thanks for shopping FOLIA</h1>
        <p className="mt-3 text-folia-ink/60">Your order is placed. Browse more rituals anytime.</p>
        <Button to="/shop" className="mt-8">
          Back to shop
        </Button>
      </section>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!path) return;
    setSubmitting(true);
    try {
      await api.post("/reviews/feedback", {
        review_type: path === "returning" ? "product" : "brand",
        rating,
        title: title.trim() || null,
        body: body.trim() || null,
        product_id: path === "returning" ? Number(productId) : null,
        guest_name: user ? null : guestName.trim(),
        discovery_source: path === "new" ? source || null : null,
        order_id: order?.id || null,
      });
      setDone(true);
      showToast("Thank you — your note means a lot");
    } catch (err) {
      showToast(err.response?.data?.detail || "Could not save feedback");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <section className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-xs uppercase tracking-[0.22em] text-folia-moss">Received</p>
        <h1 className="mt-3 font-display text-4xl">Thank you</h1>
        <p className="mt-4 text-folia-ink/60">
          Your words help us keep FOLIA calm, clear, and useful for the next guest.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/shop">Continue shopping</Button>
          <Button to={user ? "/orders" : "/"} variant="secondary">
            {user ? "View orders" : "Home"}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-14 md:px-6">
      <p className="text-xs uppercase tracking-[0.22em] text-folia-moss">Order confirmed</p>
      <h1 className="mt-3 font-display text-4xl md:text-5xl">
        {order ? `Order #${order.id} is in` : "You’re all set"}
      </h1>
      <p className="mt-3 text-folia-ink/60">
        Before you go — we’d love a short note. It only takes a moment.
      </p>

      {!path && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setPath("returning")}
            className="rounded-[1.5rem] border border-folia-sand bg-white/60 p-6 text-left transition hover:border-folia-moss"
          >
            <p className="font-display text-2xl">I’ve used FOLIA before</p>
            <p className="mt-2 text-sm text-folia-ink/55">
              Share a product review from this order — what worked for your skin.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setPath("new")}
            className="rounded-[1.5rem] border border-folia-sand bg-white/60 p-6 text-left transition hover:border-folia-moss"
          >
            <p className="font-display text-2xl">I’m new here</p>
            <p className="mt-2 text-sm text-folia-ink/55">
              Tell us how you found FOLIA and your first impression of the brand.
            </p>
          </button>
        </div>
      )}

      {path && (
        <form onSubmit={submit} className="mt-10 space-y-5 rounded-[1.5rem] border border-folia-sand bg-white/55 p-6">
          <button
            type="button"
            className="text-sm text-folia-ink/50 hover:text-folia-moss"
            onClick={() => setPath(null)}
          >
            ← Change path
          </button>

          {!user && (
            <Input
              label="Your name"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
            />
          )}

          {path === "returning" && (
            <label className="block text-xs font-medium uppercase tracking-[0.14em] text-folia-ink/60">
              Which product?
              <select
                className="mt-1.5 w-full rounded-xl border border-folia-sand bg-white/70 px-4 py-3 text-sm"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
              >
                {items.map((i) => {
                  const id = i.product_id ?? i.productId;
                  const name = i.product_name || i.name;
                  return (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </label>
          )}

          {path === "new" && (
            <label className="block text-xs font-medium uppercase tracking-[0.14em] text-folia-ink/60">
              How did you hear about FOLIA?
              <select
                className="mt-1.5 w-full rounded-xl border border-folia-sand bg-white/70 px-4 py-3 text-sm"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                required
              >
                <option value="">Choose one</option>
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-folia-ink/60">Rating</p>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`h-10 w-10 rounded-full text-lg transition ${
                    n <= rating ? "bg-folia-moss text-folia-cream" : "border border-folia-sand text-folia-ink/40"
                  }`}
                  aria-label={`${n} stars`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <Input
            label={path === "new" ? "First impression title" : "Review title"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={path === "new" ? "Calm, clear, promising…" : "Soft cleanse, no strip"}
          />
          <label className="block text-xs font-medium uppercase tracking-[0.14em] text-folia-ink/60">
            {path === "new" ? "Your first impression" : "Your experience"}
            <textarea
              className="mt-1.5 min-h-[120px] w-full rounded-xl border border-folia-sand bg-white/70 px-4 py-3 text-sm outline-none focus:border-folia-moss"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              placeholder={
                path === "new"
                  ? "What stood out when you first landed on FOLIA?"
                  : "How did this formula feel on your skin?"
              }
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Sending…" : "Submit feedback"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate(user ? "/orders" : "/")}>
              Skip for now
            </Button>
          </div>
        </form>
      )}

      {!path && (
        <p className="mt-8 text-center text-sm text-folia-ink/45">
          Or{" "}
          <Link to={user ? "/orders" : "/shop"} className="text-folia-moss hover:underline">
            continue without feedback
          </Link>
        </p>
      )}
    </section>
  );
}
