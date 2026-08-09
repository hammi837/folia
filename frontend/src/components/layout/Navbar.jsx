import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";
import { useUiStore } from "../../store/uiStore";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/shop", label: "Shop" },
  { to: "/quiz", label: "Skin Quiz" },
  { to: "/about", label: "About" },
  { to: "/wishlist", label: "Wishlist" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const user = useAuthStore((s) => s.user);
  const openCart = useUiStore((s) => s.openCart);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const linkClass = ({ isActive }) =>
    `text-sm tracking-wide transition hover:text-folia-moss ${
      isActive ? "text-folia-moss" : "text-folia-ink/80"
    }`;

  return (
    <header
      className={`sticky top-0 z-40 border-b transition ${
        scrolled
          ? "border-folia-sand bg-folia-cream"
          : "border-transparent bg-folia-cream/95"
      }`}
    >
      <div className="mx-auto flex max-w-site items-center justify-between px-4 py-4 md:px-6">
        <Link to="/" className="font-display text-2xl tracking-[0.08em]" onClick={() => setOpen(false)}>
          FOLIA
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-5">
          {user?.is_admin && (
            <NavLink to="/admin" className="hidden text-sm text-folia-moss transition hover:text-folia-ink sm:inline">
              Admin
            </NavLink>
          )}
          <NavLink
            to={user ? "/account" : "/login"}
            className="hidden text-sm text-folia-ink/80 transition hover:text-folia-moss sm:inline"
          >
            {user ? "Account" : "Login"}
          </NavLink>
          <button
            type="button"
            onClick={openCart}
            className="relative text-sm text-folia-ink/80 transition hover:text-folia-moss"
            aria-label="Open cart"
          >
            Cart
            {itemCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-folia-moss px-1.5 text-[10px] font-semibold text-folia-cream">
                {itemCount}
              </span>
            )}
          </button>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-folia-sand md:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-4 bg-folia-ink transition ${open ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-4 bg-folia-ink transition ${open ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-4 bg-folia-ink transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-folia-sand/70 bg-folia-cream md:hidden"
          >
            <nav className="flex flex-col gap-1 px-4 py-4">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className="rounded-xl px-3 py-3 text-base"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </NavLink>
              ))}
              {user?.is_admin && (
                <NavLink to="/admin" className="rounded-xl px-3 py-3 text-base" onClick={() => setOpen(false)}>
                  Admin
                </NavLink>
              )}
              <NavLink
                to={user ? "/account" : "/login"}
                className="rounded-xl px-3 py-3 text-base"
                onClick={() => setOpen(false)}
              >
                {user ? "Account" : "Login"}
              </NavLink>
              <NavLink to="/orders" className="rounded-xl px-3 py-3 text-base" onClick={() => setOpen(false)}>
                Orders
              </NavLink>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
