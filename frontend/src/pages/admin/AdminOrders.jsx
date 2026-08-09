import { useEffect, useState } from "react";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { useUiStore } from "../../store/uiStore";

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const showToast = useUiStore((s) => s.showToast);

  const load = (from = appliedFrom, to = appliedTo) => {
    setLoading(true);
    const params = {};
    if (from) params.from_date = from;
    if (to) params.to_date = to;
    return api
      .get("/admin/orders", { params })
      .then((r) => setOrders(r.data))
      .catch(() => {
        setOrders([]);
        showToast("Could not load orders");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load("", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilter = (e) => {
    e.preventDefault();
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
    load(fromDate, toDate);
  };

  const clearFilter = () => {
    setFromDate("");
    setToDate("");
    setAppliedFrom("");
    setAppliedTo("");
    load("", "");
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/orders/${id}`, { status });
      showToast("Order updated");
      load();
    } catch {
      showToast("Update failed");
    }
  };

  const filterActive = Boolean(appliedFrom || appliedTo);
  const rangeLabel =
    appliedFrom && appliedTo && appliedFrom === appliedTo
      ? appliedFrom
      : appliedFrom && appliedTo
        ? `${appliedFrom} → ${appliedTo}`
        : appliedFrom || appliedTo;

  return (
    <div>
      <h1 className="font-display text-4xl">Orders</h1>
      <p className="mt-2 text-sm text-folia-ink/55">
        Filter by order date using the store timezone (Pakistan / UTC+5).
      </p>

      <form
        onSubmit={applyFilter}
        className="mt-6 rounded-2xl border border-folia-sand bg-white/50 p-5"
      >
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-folia-ink/45">
          Date filter
        </p>
        <p className="mt-1 text-sm text-folia-ink/50">
          Pick one day (same from/to) or a custom range.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-folia-ink/50">
              From
            </span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-xl border border-folia-sand bg-white/70 px-3 py-2 text-sm outline-none focus:border-folia-moss"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-folia-ink/50">
              To
            </span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-xl border border-folia-sand bg-white/70 px-3 py-2 text-sm outline-none focus:border-folia-moss"
            />
          </label>
          <Button type="submit" disabled={!fromDate && !toDate}>
            Show orders
          </Button>
          {filterActive && (
            <Button type="button" variant="ghost" onClick={clearFilter}>
              Clear
            </Button>
          )}
        </div>
        {filterActive && (
          <p className="mt-4 text-sm text-folia-moss">
            Showing {orders.length} order{orders.length === 1 ? "" : "s"} for {rangeLabel}
          </p>
        )}
      </form>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-folia-sand bg-white/50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-xl">Order #{o.id}</p>
                  <p className="mt-1 text-sm text-folia-ink/55">
                    {o.email} · {new Date(o.created_at).toLocaleString()}
                  </p>
                  {o.promo_code && (
                    <p className="mt-1 text-sm text-folia-moss">
                      Promo {o.promo_code} (−${Number(o.discount_amount || 0).toFixed(2)})
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">${Number(o.total).toFixed(2)}</p>
                  <select
                    className="mt-2 rounded-full border border-folia-sand bg-white px-3 py-1.5 text-sm"
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <ul className="mt-4 space-y-1 text-sm text-folia-ink/70">
                {o.items?.map((item) => (
                  <li key={item.id}>
                    {item.product_name} × {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {!orders.length && (
            <p className="text-folia-ink/50">
              {filterActive ? "No orders in this date range." : "No orders yet."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
