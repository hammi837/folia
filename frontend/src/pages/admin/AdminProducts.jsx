import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import { useUiStore } from "../../store/uiStore";

const empty = {
  name: "",
  slug: "",
  short_description: "",
  description: "",
  price: "",
  compare_at_price: "",
  discount_percent: "",
  category_id: "",
  stock: "50",
  low_stock_threshold: "10",
  is_featured: false,
  is_active: true,
  image_urls: "",
  concerns: "",
  skin_types: "",
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const showToast = useUiStore((s) => s.showToast);

  const load = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([api.get("/admin/products"), api.get("/admin/categories")]);
      setProducts(p.data);
      setCategories(c.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const uploadPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const body = new FormData();
        body.append("file", file);
        const { data } = await api.post("/admin/upload", body, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        urls.push(data.url);
      }
      setForm((f) => ({
        ...f,
        image_urls: [f.image_urls, ...urls].filter(Boolean).join("\n"),
      }));
      showToast(`${urls.length} photo(s) uploaded`);
    } catch {
      showToast("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      short_description: product.short_description || "",
      description: product.description || "",
      price: String(product.price),
      compare_at_price: product.compare_at_price ? String(product.compare_at_price) : "",
      discount_percent: product.discount_percent != null ? String(product.discount_percent) : "",
      category_id: product.category?.id ? String(product.category.id) : "",
      stock: String(product.stock ?? 50),
      low_stock_threshold: String(product.low_stock_threshold ?? 10),
      is_featured: !!product.is_featured,
      is_active: product.is_active !== false,
      image_urls: (product.images || []).map((i) => i.url).join("\n"),
      concerns: (product.concerns || []).join(", "),
      skin_types: (product.skin_types || []).join(", "),
    });
  };

  const reset = () => {
    setEditingId(null);
    setForm(empty);
  };

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      slug: form.slug || form.name,
      short_description: form.short_description || null,
      description: form.description || null,
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      discount_percent: form.discount_percent ? Number(form.discount_percent) : null,
      category_id: form.category_id ? Number(form.category_id) : null,
      stock: Number(form.stock || 0),
      low_stock_threshold: Number(form.low_stock_threshold || 10),
      is_featured: form.is_featured,
      is_active: form.is_active,
      image_urls: form.image_urls
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      concerns: form.concerns
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      skin_types: form.skin_types
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      ingredients: [],
      results_timeline: [],
    };
    try {
      if (editingId) await api.put(`/admin/products/${editingId}`, payload);
      else await api.post("/admin/products", payload);
      showToast(editingId ? "Product updated" : "Product created");
      reset();
      load();
    } catch (err) {
      showToast(err.response?.data?.detail || "Save failed");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this product?")) return;
    await api.delete(`/admin/products/${id}`);
    showToast("Product deleted");
    load();
  };

  return (
    <div>
      <h1 className="font-display text-4xl">Products</h1>
      <div className="mt-8 grid gap-10 xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          {loading ? (
            <Spinner />
          ) : (
            <div className="space-y-3">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-4 rounded-2xl border border-folia-sand bg-white/50 p-4">
                  <div className="h-16 w-14 overflow-hidden bg-folia-sand/40">
                    {p.images?.[0] && <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-lg">{p.name}</p>
                    <p className="text-sm text-folia-ink/55">
                      ${Number(p.sale_price ?? p.price).toFixed(2)}
                      {p.applied_discount_percent ? ` (−${Number(p.applied_discount_percent)}%)` : ""} · stock {p.stock}
                      {p.is_low_stock && <span className="ml-2 text-red-700">Low stock alert</span>}
                    </p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => startEdit(p)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={save} className="h-fit space-y-3 rounded-2xl border border-folia-sand bg-white/60 p-5">
          <h2 className="font-display text-2xl">{editingId ? "Edit product" : "Add product"}</h2>
          <Input label="Name" name="name" required value={form.name} onChange={onChange} />
          <Input label="Slug" name="slug" value={form.slug} onChange={onChange} placeholder="auto from name" />
          <Input label="Short description" name="short_description" value={form.short_description} onChange={onChange} />
          <label className="block text-xs font-medium uppercase tracking-[0.14em] text-folia-ink/60">
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              className="mt-1.5 w-full rounded-xl border border-folia-sand bg-white/60 px-4 py-3 text-sm"
              rows={3}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price" name="price" required value={form.price} onChange={onChange} />
            <Input label="Compare at" name="compare_at_price" value={form.compare_at_price} onChange={onChange} />
          </div>
          <Input
            label="Product discount %"
            name="discount_percent"
            value={form.discount_percent}
            onChange={onChange}
            placeholder="e.g. 15"
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-medium uppercase tracking-[0.14em] text-folia-ink/60">
              Category
              <select
                name="category_id"
                value={form.category_id}
                onChange={onChange}
                className="mt-1.5 w-full rounded-xl border border-folia-sand bg-white/60 px-4 py-3 text-sm"
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.discount_percent ? ` (−${c.discount_percent}%)` : ""}
                  </option>
                ))}
              </select>
            </label>
            <Input label="Stock" name="stock" value={form.stock} onChange={onChange} />
          </div>
          <Input
            label="Low stock alert at"
            name="low_stock_threshold"
            value={form.low_stock_threshold}
            onChange={onChange}
            placeholder="10"
          />
          <p className="text-xs text-folia-ink/50">Dashboard alerts when stock ≤ this number.</p>

          <label className="block text-xs font-medium uppercase tracking-[0.14em] text-folia-ink/60">
            Upload photos
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={uploadPhotos}
              className="mt-1.5 block w-full text-sm"
            />
          </label>
          {uploading && <p className="text-xs text-folia-moss">Uploading…</p>}
          <label className="block text-xs font-medium uppercase tracking-[0.14em] text-folia-ink/60">
            Image URLs (one per line)
            <textarea
              name="image_urls"
              value={form.image_urls}
              onChange={onChange}
              className="mt-1.5 w-full rounded-xl border border-folia-sand bg-white/60 px-4 py-3 text-sm"
              rows={3}
              placeholder="Upload above or paste https://..."
            />
          </label>
          {form.image_urls && (
            <div className="flex flex-wrap gap-2">
              {form.image_urls
                .split("\n")
                .map((u) => u.trim())
                .filter(Boolean)
                .map((url) => (
                  <img key={url} src={url} alt="" className="h-14 w-12 rounded object-cover" />
                ))}
            </div>
          )}
          <Input label="Concerns (comma)" name="concerns" value={form.concerns} onChange={onChange} />
          <Input label="Skin types (comma)" name="skin_types" value={form.skin_types} onChange={onChange} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={onChange} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={onChange} />
            Active
          </label>
          <div className="flex gap-2 pt-2">
            <Button type="submit">{editingId ? "Update" : "Create"}</Button>
            {editingId && (
              <Button type="button" variant="ghost" onClick={reset}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
