import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { useAuthStore } from "../store/authStore";

export default function Account() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  if (!user) {
    return (
      <section className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Account</h1>
        <p className="mt-3 text-folia-ink/60">Sign in to view your profile and orders.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Button to="/login">Login</Button>
          <Button to="/register" variant="secondary">
            Register
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-site px-4 py-12 md:px-6">
      <h1 className="font-display text-4xl">Hello{user.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}</h1>
      <p className="mt-2 text-folia-ink/60">{user.email}</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Link to="/orders" className="rounded-2xl border border-folia-sand bg-white/40 p-6 hover:border-folia-moss">
          <h2 className="font-display text-xl">Orders</h2>
          <p className="mt-2 text-sm text-folia-ink/55">Track past purchases</p>
        </Link>
        <Link to="/wishlist" className="rounded-2xl border border-folia-sand bg-white/40 p-6 hover:border-folia-moss">
          <h2 className="font-display text-xl">Wishlist</h2>
          <p className="mt-2 text-sm text-folia-ink/55">Saved rituals</p>
        </Link>
        <Link to="/quiz" className="rounded-2xl border border-folia-sand bg-white/40 p-6 hover:border-folia-moss">
          <h2 className="font-display text-xl">Skin quiz</h2>
          <p className="mt-2 text-sm text-folia-ink/55">Refresh your matches</p>
        </Link>
      </div>

      <Button
        variant="secondary"
        className="mt-10"
        onClick={() => {
          logout();
          navigate("/");
        }}
      >
        Sign out
      </Button>
    </section>
  );
}
