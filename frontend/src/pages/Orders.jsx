import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import { useAuthStore } from "../store/authStore";

export default function Orders() {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let alive = true;
    api
      .get("/orders/")
      .then((res) => {
        if (alive) setOrders(res.data);
      })
      .catch(() => {
        if (alive) setOrders([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  if (!user) {
    return (
      <EmptyState
        title="Login to view orders"
        description="Your order history appears here after checkout."
        actionLabel="Login"
        actionTo="/login"
      />
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (!orders.length) {
    return (
      <EmptyState
        title="No orders yet"
        description="Place a test order from checkout to see it here."
        actionLabel="Shop"
        actionTo="/shop"
      />
    );
  }

  return (
    <section className="mx-auto max-w-site px-4 py-12 md:px-6">
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-display text-4xl">Orders</h1>
        <Button to="/account" variant="ghost">
          Account
        </Button>
      </div>
      <ul className="mt-10 space-y-4">
        {orders.map((order) => (
          <li key={order.id} className="rounded-2xl border border-folia-sand bg-white/40 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-xl">Order #{order.id}</p>
                <p className="mt-1 text-sm text-folia-ink/55">
                  {new Date(order.created_at).toLocaleString()} · {order.status}
                </p>
              </div>
              <p className="font-medium">${Number(order.total).toFixed(2)}</p>
            </div>
            <ul className="mt-4 space-y-1 text-sm text-folia-ink/70">
              {order.items?.map((item) => (
                <li key={item.id}>
                  {item.product_name} × {item.quantity}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-folia-ink/50">
        Need something else? <Link to="/shop" className="text-folia-moss hover:underline">Continue shopping</Link>
      </p>
    </section>
  );
}
