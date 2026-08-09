import { useEffect, useState } from "react";
import { Navigate, NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Spinner from "../ui/Spinner";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/homepage", label: "Site images" },
  { to: "/admin/cards", label: "Page cards" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/promos", label: "Promo codes" },
  { to: "/admin/offers", label: "Offers" },
  { to: "/admin/reviews", label: "Reviews" },
];

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const hydrateUser = useAuthStore((s) => s.hydrateUser);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      await hydrateUser();
      if (alive) setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, [hydrateUser]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-folia-cream">
        <Spinner />
      </div>
    );
  }

  if (!token || !user) return <Navigate to="/login?next=/admin" replace />;
  if (!user.is_admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-folia-cream px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl">Admin only</h1>
          <p className="mt-3 text-folia-ink/60">This account does not have admin access.</p>
          <NavLink to="/" className="mt-6 inline-block text-folia-moss underline">
            Back to store
          </NavLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3eee6] text-folia-ink lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-folia-sand bg-folia-moss text-folia-cream lg:min-h-screen lg:border-b-0 lg:border-r lg:border-folia-moss">
        <div className="px-5 py-6">
          <p className="font-display text-2xl tracking-[0.12em]">FOLIA</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-folia-cream/55">Admin</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col lg:overflow-visible">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-xl px-4 py-2.5 text-sm transition ${
                  isActive ? "bg-folia-cream/15 text-folia-cream" : "text-folia-cream/70 hover:bg-folia-cream/10"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden px-5 pb-6 lg:block">
          <NavLink to="/" className="text-xs text-folia-cream/55 hover:text-folia-cream">
            ← Home page (storefront)
          </NavLink>
        </div>
      </aside>
      <div className="px-4 py-8 md:px-8">
        <Outlet />
      </div>
    </div>
  );
}
