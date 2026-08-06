import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore } from "../../store/cartStore";
import { useUiStore } from "../../store/uiStore";
import Button from "../ui/Button";

export default function CartDrawer() {
  const open = useUiStore((s) => s.cartOpen);
  const closeCart = useUiStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close cart"
            className="fixed inset-0 z-50 bg-folia-ink/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-folia-cream shadow-soft"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            <div className="flex items-center justify-between border-b border-folia-sand px-5 py-4">
              <h2 className="font-display text-xl">Your bag</h2>
              <button type="button" onClick={closeCart} className="text-sm text-folia-ink/60 hover:text-folia-ink">
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <p className="py-16 text-center text-sm text-folia-ink/55">Your bag is empty.</p>
              ) : (
                <ul className="space-y-5">
                  {items.map((item) => (
                    <li key={item.key} className="flex gap-4">
                      <div className="h-20 w-16 overflow-hidden bg-folia-sand/50">
                        {item.image && (
                          <img src={item.image} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between gap-3">
                          <div>
                            <Link
                              to={`/product/${item.slug}`}
                              onClick={closeCart}
                              className="font-display text-base hover:text-folia-moss"
                            >
                              {item.name}
                            </Link>
                            {item.variantName && (
                              <p className="text-xs text-folia-ink/50">{item.variantName}</p>
                            )}
                          </div>
                          <p className="text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full border border-folia-sand">
                            <button
                              type="button"
                              className="px-3 py-1 text-sm"
                              onClick={() => setQuantity(item.key, item.quantity - 1)}
                            >
                              −
                            </button>
                            <span className="px-2 text-sm">{item.quantity}</span>
                            <button
                              type="button"
                              className="px-3 py-1 text-sm"
                              onClick={() => setQuantity(item.key, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            className="text-xs text-folia-ink/50 hover:text-folia-moss"
                            onClick={() => removeItem(item.key)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-folia-sand px-5 py-5">
              <div className="mb-4 flex justify-between text-sm">
                <span className="text-folia-ink/60">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <Button to="/checkout" className="w-full" onClick={closeCart} disabled={!items.length}>
                Checkout
              </Button>
              <Button to="/cart" variant="ghost" className="mt-2 w-full" onClick={closeCart}>
                View bag
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
