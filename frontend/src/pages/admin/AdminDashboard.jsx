import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [customRevenue, setCustomRevenue] = useState(null);
  const [loadingCustom, setLoadingCustom] = useState(false);

  useEffect(() => {
    api.get("/admin/dashboard").then((r) => setStats(r.data)).catch(() => setStats(null));
  }, []);

  const loadCustom = async (e) => {
    e?.preventDefault();
    if (!fromDate && !toDate) return;
    setLoadingCustom(true);
    try {
      const start = fromDate || toDate;
      const end = toDate || fromDate;
      const params = { from: start, to: end };
      const { data } = await api.get("/admin/revenue", { params });
      setCustomRevenue(data);
      if (!toDate && fromDate) setToDate(fromDate);
      if (!fromDate && toDate) setFromDate(toDate);
    } catch {
      setCustomRevenue(null);
    } finally {
      setLoadingCustom(false);
    }
  };

  const clearCustom = () => {
    setFromDate("");
    setToDate("");
    setCustomRevenue(null);
  };

  if (!stats) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const rb = stats.revenue_breakdown || {};
  const cards = [
    ["Products", stats.products, "/admin/products"],
    ["Categories", stats.categories, "/admin/categories"],
    ["Orders", stats.orders, "/admin/orders"],
    ["All-time revenue", money(stats.revenue), "/admin/orders"],
    ["Active promos", stats.active_promos, "/admin/promos"],
    ["Active offers", stats.active_offers, "/admin/offers"],
    ["Low stock alerts", stats.low_stock_count ?? 0, "/admin/products"],
    ["Users", stats.users, "/admin"],
  ];

  const periodCards = [
    { label: "Today", hint: "Orders placed today", value: rb.today },
    { label: "This week", hint: "Monday → now", value: rb.week },
    { label: "This month", hint: "Calendar month", value: rb.month },
    { label: "This year", hint: "Calendar year", value: rb.year },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl">Dashboard</h1>
      <p className="mt-2 text-folia-ink/55">Manage catalogue, orders, discounts, and stock alerts.</p>

      {(stats.low_stock_alerts?.length ?? 0) > 0 && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50/80 p-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-red-800">Stock alerts</p>
          <p className="mt-2 text-sm text-red-900/80">
            {stats.low_stock_count} product(s) at or below their alert threshold.
          </p>
          <ul className="mt-4 space-y-2">
            {stats.low_stock_alerts.map((a) => (
              <li key={a.id} className="flex items-center justify-between text-sm">
                <span className="font-medium text-red-950">{a.name}</span>
                <span className="text-red-800">
                  {a.stock} left · alert at {a.low_stock_threshold}
                </span>
              </li>
            ))}
          </ul>
          <Link to="/admin/products" className="mt-4 inline-block text-sm text-red-900 underline">
            Manage products →
          </Link>
        </div>
      )}

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl">Revenue</h2>
            <p className="mt-1 text-sm text-folia-ink/50">
              Totals exclude cancelled orders. Days use store timezone (Pakistan / UTC+5).
            </p>
          </div>
          <Link to="/admin/orders" className="text-sm text-folia-moss hover:underline">
            View orders →
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {periodCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-folia-sand bg-white/60 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-folia-ink/45">{card.label}</p>
              <p className="mt-3 font-display text-3xl">{money(card.value)}</p>
              <p className="mt-2 text-xs text-folia-ink/45">{card.hint}</p>
            </div>
          ))}
        </div>

        <form
          onSubmit={loadCustom}
          className="mt-6 rounded-2xl border border-folia-sand bg-white/50 p-5"
        >
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-folia-ink/45">
            Specific date range
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
            <Button type="submit" disabled={loadingCustom || (!fromDate && !toDate)}>
              {loadingCustom ? "Loading…" : "Show revenue"}
            </Button>
            {(fromDate || toDate || customRevenue) && (
              <Button type="button" variant="ghost" onClick={clearCustom}>
                Clear
              </Button>
            )}
          </div>

          {customRevenue?.custom != null && (
            <div className="mt-5 rounded-xl bg-folia-mist/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-folia-ink/50">
                {customRevenue.custom_from === customRevenue.custom_to
                  ? `Revenue on ${customRevenue.custom_from}`
                  : `Revenue ${customRevenue.custom_from} → ${customRevenue.custom_to}`}
              </p>
              <p className="mt-2 font-display text-3xl">{money(customRevenue.custom)}</p>
              <p className="mt-1 text-sm text-folia-ink/55">
                {customRevenue.custom_orders ?? 0} paid order
                {(customRevenue.custom_orders ?? 0) === 1 ? "" : "s"} in range
              </p>
            </div>
          )}
        </form>
      </section>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, to]) => (
          <Link
            key={label}
            to={to}
            className={`rounded-2xl border bg-white/50 p-5 transition hover:border-folia-moss ${
              label === "Low stock alerts" && stats.low_stock_count > 0
                ? "border-red-300"
                : "border-folia-sand"
            }`}
          >
            <p className="text-xs uppercase tracking-[0.18em] text-folia-ink/45">{label}</p>
            <p className="mt-3 font-display text-3xl">{value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
