import { useEffect, useState } from "react";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { useUiStore } from "../../store/uiStore";

export default function AdminReviews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const showToast = useUiStore((s) => s.showToast);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/reviews");
      setItems(data);
    } catch {
      setItems([]);
      showToast("Could not load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleHome = async (review) => {
    setSavingId(review.id);
    try {
      const { data } = await api.patch(`/admin/reviews/${review.id}`, {
        show_on_home: !review.show_on_home,
      });
      setItems((list) => list.map((r) => (r.id === data.id ? data : r)));
      showToast(data.show_on_home ? "Added to homepage scroller" : "Removed from homepage scroller");
    } catch {
      showToast("Update failed");
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this review permanently?")) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      setItems((list) => list.filter((r) => r.id !== id));
      showToast("Review deleted");
    } catch {
      showToast("Delete failed");
    }
  };

  const onHome = items.filter((r) => r.show_on_home).length;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-4xl">Reviews</h1>
      <p className="mt-2 text-sm text-folia-ink/55">
        Choose which reviews appear in the homepage scroller. New customer feedback starts hidden
        until you enable it here.
      </p>
      <p className="mt-3 text-sm text-folia-moss">
        {onHome} selected for homepage · {items.length} total
      </p>

      <div className="mt-8 space-y-3">
        {items.map((r) => (
          <div
            key={r.id}
            className={`rounded-2xl border p-5 ${
              r.show_on_home ? "border-folia-moss bg-folia-mist/50" : "border-folia-sand bg-white/50"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-folia-ink/45">
                  <span>{r.review_type === "brand" ? "Brand" : "Product"}</span>
                  <span>·</span>
                  <span>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  {r.show_on_home && (
                    <span className="rounded-full bg-folia-moss px-2 py-0.5 text-folia-cream">On home</span>
                  )}
                </div>
                {r.title && <p className="mt-2 font-display text-xl">{r.title}</p>}
                {r.body && <p className="mt-2 text-sm leading-relaxed text-folia-ink/65">{r.body}</p>}
                <p className="mt-3 text-sm text-folia-ink/50">
                  {r.user_name || "Guest"}
                  {r.product_name ? ` · ${r.product_name}` : ""}
                  {r.discovery_source ? ` · via ${r.discovery_source}` : ""}
                  {r.created_at ? ` · ${new Date(r.created_at).toLocaleDateString()}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={r.show_on_home ? "secondary" : "primary"}
                  disabled={savingId === r.id}
                  onClick={() => toggleHome(r)}
                >
                  {savingId === r.id
                    ? "Saving…"
                    : r.show_on_home
                      ? "Hide from scroller"
                      : "Show on homepage"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(r.id)}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
        {!items.length && (
          <p className="rounded-2xl border border-dashed border-folia-sand px-5 py-12 text-center text-sm text-folia-ink/50">
            No reviews yet. They appear here after customers submit feedback at checkout.
          </p>
        )}
      </div>
    </div>
  );
}
