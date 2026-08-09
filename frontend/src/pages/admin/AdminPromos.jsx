import { useEffect, useState } from "react";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useUiStore } from "../../store/uiStore";

const empty = {
  code: "",
  description: "",
  discount_type: "percent",
  value: "10",
  min_order: "0",
  usage_limit: "",
  is_active: true,
};

export default function AdminPromos() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const showToast = useUiStore((s) => s.showToast);

  const load = () => api.get("/admin/promos").then((r) => setItems(r.data));
  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      code: form.code,
      description: form.description || null,
      discount_type: form.discount_type,
      value: Number(form.value),
      min_order: Number(form.min_order || 0),
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      is_active: form.is_active,
    };
    try {
      if (editingId) await api.put(`/admin/promos/${editingId}`, payload);
      else await api.post("/admin/promos", payload);
      showToast("Promo saved");
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.detail || "Save failed");
    }
  };

  return (
    <div>
      <h1 className="font-display text-4xl">Promo codes</h1>
      <p className="mt-2 text-sm text-folia-ink/55">Customers apply these at checkout (e.g. FOLIA10).</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          {items.map((p) => (
            <div key={p.id} className="rounded-2xl border border-folia-sand bg-white/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-xl">{p.code}</p>
                  <p className="text-sm text-folia-ink/55">
                    {p.discount_type === "percent" ? `${p.value}%` : `$${p.value}`} off · used {p.used_count}
                    {p.usage_limit != null ? `/${p.usage_limit}` : ""} · min ${Number(p.min_order).toFixed(0)}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-folia-moss">
                    {p.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditingId(p.id);
                      setForm({
                        code: p.code,
                        description: p.description || "",
                        discount_type: p.discount_type,
                        value: String(p.value),
                        min_order: String(p.min_order),
                        usage_limit: p.usage_limit != null ? String(p.usage_limit) : "",
                        is_active: p.is_active,
                      });
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      if (!confirm("Delete promo?")) return;
                      await api.delete(`/admin/promos/${p.id}`);
                      load();
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={save} className="space-y-3 rounded-2xl border border-folia-sand bg-white/60 p-5">
          <h2 className="font-display text-2xl">{editingId ? "Edit promo" : "Create promo"}</h2>
          <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <label className="block text-xs font-medium uppercase tracking-[0.14em] text-folia-ink/60">
            Type
            <select
              className="mt-1.5 w-full rounded-xl border border-folia-sand px-4 py-3 text-sm"
              value={form.discount_type}
              onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
            >
              <option value="percent">Percent</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Value" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
            <Input
              label="Min order"
              value={form.min_order}
              onChange={(e) => setForm({ ...form, min_order: e.target.value })}
            />
          </div>
          <Input
            label="Usage limit"
            value={form.usage_limit}
            onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
            placeholder="Unlimited"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Active
          </label>
          <Button type="submit">Save</Button>
        </form>
      </div>
    </div>
  );
}
