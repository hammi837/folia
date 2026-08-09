import { useEffect, useState } from "react";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useUiStore } from "../../store/uiStore";

const emptyForm = { name: "", slug: "", description: "", discount_percent: "", image_url: "" };

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const showToast = useUiStore((s) => s.showToast);

  const load = () => api.get("/admin/categories").then((r) => setItems(r.data));
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
      showToast("Category image uploaded");
    } catch {
      showToast("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      slug: form.slug || form.name,
      description: form.description || null,
      discount_percent: form.discount_percent ? Number(form.discount_percent) : null,
      image_url: form.image_url || null,
    };
    try {
      if (editingId) await api.put(`/admin/categories/${editingId}`, payload);
      else await api.post("/admin/categories", payload);
      showToast("Category saved");
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.detail || "Save failed");
    }
  };

  return (
    <div>
      <h1 className="font-display text-4xl">Categories</h1>
      <p className="mt-2 text-sm text-folia-ink/55">
        Add a collection image and optional discount % for all products in the category.
      </p>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          {items.map((c) => (
            <div key={c.id} className="flex items-center gap-4 rounded-2xl border border-folia-sand bg-white/50 p-4">
              <div className="h-16 w-14 shrink-0 overflow-hidden bg-folia-sand/50">
                {c.image_url ? (
                  <img src={c.image_url} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1">
                <p className="font-display text-lg">{c.name}</p>
                <p className="text-sm text-folia-ink/50">
                  {c.slug}
                  {c.discount_percent != null ? ` · ${c.discount_percent}% off` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditingId(c.id);
                    setForm({
                      name: c.name,
                      slug: c.slug,
                      description: c.description || "",
                      discount_percent: c.discount_percent != null ? String(c.discount_percent) : "",
                      image_url: c.image_url || "",
                    });
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    if (!confirm("Delete category?")) return;
                    await api.delete(`/admin/categories/${c.id}`);
                    load();
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={save} className="space-y-3 rounded-2xl border border-folia-sand bg-white/60 p-5">
          <h2 className="font-display text-2xl">{editingId ? "Edit" : "Add"} category</h2>
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <Input
            label="Description / tagline"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label="Category discount %"
            value={form.discount_percent}
            onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
            placeholder="e.g. 20"
          />
          <label className="block text-xs font-medium uppercase tracking-[0.14em] text-folia-ink/60">
            Upload category image
            <input type="file" accept="image/*" onChange={uploadImage} className="mt-1.5 block w-full text-sm" />
          </label>
          {uploading && <p className="text-xs text-folia-moss">Uploading…</p>}
          <Input
            label="Or image URL"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            placeholder="/uploads/products/... or https://"
          />
          {form.image_url && (
            <img src={form.image_url} alt="" className="h-28 w-full rounded-xl object-cover" />
          )}
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            {editingId && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
