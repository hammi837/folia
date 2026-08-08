import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";

export default function Login() {
  const setSession = useAuthStore((s) => s.setSession);
  const showToast = useUiStore((s) => s.showToast);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      setSession(data.access_token, data.user);
      showToast("Welcome back");
      navigate("/account");
    } catch (err) {
      showToast(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl">Login</h1>
      <p className="mt-2 text-sm text-folia-ink/55">
        Demo: <span className="text-folia-ink">demo@folia.beauty</span> / folia123
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Input
          label="Email"
          type="email"
          name="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-folia-ink/60">
        New here?{" "}
        <Link to="/register" className="text-folia-moss hover:underline">
          Create an account
        </Link>
      </p>
    </section>
  );
}
