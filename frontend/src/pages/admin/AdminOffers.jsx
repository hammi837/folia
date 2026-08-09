import { useEffect, useState } from "react";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useUiStore } from "../../store/uiStore";

const empty = {
  title: "",
  badge_text: "",
  description: "",
  discount_percent: "",
  image_url: "",
  category_id: "",
  product_id: "",
  is_active: true,
};

export default function AdminOffers() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const showToast = useUiStore((s) => s.showToast);

  const load = async () => {
    const [o, c, p] = await Promise.all([
      api.get("/admin/offers"),
      api.get("/admin/categories"),
      api.get("/admin/products"),
    ]);
    setItems(o.data);
    setCategories(c.data);
    setProducts(p.data);
  };

  useEffect(() => {
    load();
  }, []);

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const { data } = await api.post("/admin/upload", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({ ...f, image_url: data.url }));
      showToast("Offer image uploaded");
    } catch {
      showToast("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.discount_percent) {
      showToast("Add a discount % to apply on category or product");
      return;
    }
    if (!form.category_id && !form.product_id) {
      showToast("Select a category or a product for this discount");
      return;
    }
    const payload = {
      title: form.title,
      badge_text: form.badge_text || null,
      description: form.description || null,
      discount_percent: form.discount_percent ? Number(form.discount_percent) : null,
      image_url: form.image_url || null,
      category_id: form.category_id ? Number(form.category_id) : null,
      product_id: form.product_id ? Number(form.product_id) : null,
      is_active: form.is_active,
    };
    try {
      if (editingId) await api.put(`/admin/offers/${editingId}`, payload);
      else await api.post("/admin/offers", payload);
      showToast("Offer saved — discount applies on storefront");
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.detail || "Save failed");
    }
  };

  return (
    <div>
      <h1 className="font-display text-4xl">Offers & discounts</h1>
      <p className="mt-2 text-sm text-folia-ink/55">
        Apply a % discount to a whole category or a single product. Highest discount wins if multiple apply.
        Also shows as a homepage campaign card when an image is set.
      </p>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          {items.map((o) => (
            <div key={o.id} className="overflow-hidden rounded-2xl border border-folia-sand bg-white/50">
              {o.image_url && <img src={o.image_url} alt="" className="h-32 w-full object-cover" />}
              <div className="p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-folia-moss">{o.badge_text || "Offer"}</p>
                <p className="font-display text-xl">{o.title}</p>
                <p className="mt-1 text-sm text-folia-ink/55">
                  {o.discount_percent != null ? `${o.discount_percent}% off` : "No %"}
                  {o.category_id ? " · category" : ""}
                  {o.product_id ? " · product" : ""}
                  {!o.is_active ? " · inactive" : ""}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditingId(o.id);
                      setForm({
                        title: o.title,
                        badge_text: o.badge_text || "",
                        description: o.description || "",
                        discount_percent: o.discount_percent != null ? String(o.discount_percent) : "",
                        image_url: o.image_url || "",
                        category_id: o.category_id ? String(o.category_id) : "",
                        product_id: o.product_id ? String(o.product_id) : "",
                        is_active: o.is_active,
                      });
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      if (!confirm("Delete offer?")) return;
                      await api.delete(`/admin/offers/${o.id}`);
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
          <h2 className="font-display text-2xl">{editingId ? "Edit offer" : "Create offer"}</h2>
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input
            label="Badge text"
            value={form.badge_text}
            onChange={(e) => setForm({ ...form, badge_text: e.target.value })}
            placeholder="Save 15%"
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label="Discount % (required)"
            value={form.discount_percent}
            onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
            required
          />
          <label className="block text-xs font-medium uppercase tracking-[0.14em] text-folia-ink/60">
            Upload banner image
            <input type="file" accept="image/*" onChange={uploadImage} className="mt-1.5 block w-full text-sm" />
          </label>
          {uploading && <p className="text-xs text-folia-moss">Uploading…</p>}
          <Input
            label="Or banner image URL"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            placeholder="/uploads/products/... or https://"
          />
          {form.image_url && (
            <img src={form.image_url} alt="" className="h-28 w-full rounded-xl object-cover" />
          )}
          <label className="block text-xs font-medium uppercase tracking-[0.14em] text-folia-ink/60">
            Apply to category
            <select
              className="mt-1.5 w-full rounded-xl border border-folia-sand px-4 py-3 text-sm"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value, product_id: "" })}
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium uppercase tracking-[0.14em] text-folia-ink/60">
            Or apply to one product
            <select
              className="mt-1.5 w-full rounded-xl border border-folia-sand px-4 py-3 text-sm"
              value={form.product_id}
              onChange={(e) => setForm({ ...form, product_id: e.target.value, category_id: "" })}
            >
              <option value="">None</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
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
