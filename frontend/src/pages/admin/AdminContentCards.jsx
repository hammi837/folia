import { useEffect, useState } from "react";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import SoftImage from "../../components/ui/SoftImage";
import Spinner from "../../components/ui/Spinner";
import { useUiStore } from "../../store/uiStore";

const empty = {
  page_key: "home_brand",
  title: "",
  body: "",
  image_url: "",
  layout: "text",
  sort_order: 0,
  is_active: true,
};

const LAYOUT_HINTS = {
  text: "Title and body only — no image.",
  background: "Picture fills the whole card; text sits on top.",
  image_left: "Picture on the left, text on the right.",
  image_right: "Text on the left, picture on the right.",
};

export default function AdminContentCards() {
  const [sections, setSections] = useState([]);
  const [layouts, setLayouts] = useState([
    { key: "text", label: "Text only" },
    { key: "background", label: "Full background image + text overlay" },
    { key: "image_left", label: "Image left · text right" },
    { key: "image_right", label: "Text left · image right" },
  ]);
  const [pageKey, setPageKey] = useState("home_brand");
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const showToast = useUiStore((s) => s.showToast);

  const load = async (key = pageKey) => {
    setLoading(true);
    try {
      const [meta, cards] = await Promise.all([
        api.get("/admin/content-cards/sections"),
        api.get("/admin/content-cards", { params: { page_key: key } }),
      ]);
      const data = meta.data;
      if (Array.isArray(data)) {
        setSections(data);
      } else {
        setSections(data.sections || []);
        if (data.layouts?.length) setLayouts(data.layouts);
      }
      setItems(cards.data);
    } catch {
      setItems([]);
      showToast("Could not load content cards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load("home_brand");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeSection = (key) => {
    setPageKey(key);
    setEditingId(null);
    setForm({ ...empty, page_key: key, sort_order: items.length });
    load(key);
  };

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
      setForm((f) => ({
        ...f,
        image_url: data.url,
        layout: f.layout === "text" ? "background" : f.layout,
      }));
      showToast("Image uploaded");
    } catch {
      showToast("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast("Title is required");
      return;
    }
    if (form.layout !== "text" && !form.image_url) {
      showToast("Upload an image for this layout");
      return;
    }
    const payload = {
      page_key: form.page_key || pageKey,
      title: form.title.trim(),
      body: form.body.trim() || null,
      image_url: form.image_url || null,
      layout: form.layout || "text",
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };
    try {
      if (editingId) await api.put(`/admin/content-cards/${editingId}`, payload);
      else await api.post("/admin/content-cards", payload);
      showToast(editingId ? "Card updated" : "Card added");
      setForm({ ...empty, page_key: pageKey });
      setEditingId(null);
      load(pageKey);
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(typeof detail === "string" ? detail : "Save failed");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this card?")) return;
    try {
      await api.delete(`/admin/content-cards/${id}`);
      showToast("Card deleted");
      load(pageKey);
    } catch {
      showToast("Delete failed");
    }
  };

  const sectionLabel = sections.find((s) => s.key === pageKey)?.label || pageKey;
  const layoutLabel = (key) => layouts.find((l) => l.key === key)?.label || key;

  return (
    <div>
      <h1 className="font-display text-4xl">Page cards</h1>
      <p className="mt-2 max-w-2xl text-sm text-folia-ink/55">
        Add cards for any storefront section. Choose text-only, a full background photo, or a
        split layout with the image on the left or right.
      </p>

      <div className="mt-6">
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-folia-ink/50">
            Screen / section
          </span>
          <select
            value={pageKey}
            onChange={(e) => changeSection(e.target.value)}
            className="w-full max-w-md rounded-xl border border-folia-sand bg-white px-3 py-2.5 text-sm outline-none focus:border-folia-moss"
          >
            {sections.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.16em] text-folia-ink/45">
            Cards on {sectionLabel} · {items.length}
          </p>
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : (
            <>
              {items.map((card, i) => (
                <div
                  key={card.id}
                  className={`overflow-hidden rounded-2xl border ${
                    card.is_active
                      ? "border-folia-sand bg-white/50"
                      : "border-dashed border-folia-sand bg-folia-mist/40 opacity-70"
                  }`}
                >
                  {card.image_url && (
                    <div className="h-28 overflow-hidden bg-folia-sand/40">
                      <SoftImage
                        src={card.image_url}
                        alt=""
                        className="h-full w-full"
                        imgClassName="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-folia-moss">
                      {String(i + 1).padStart(2, "0")}
                      {!card.is_active ? " · hidden" : ""}
                      <span className="text-folia-ink/35">
                        {" "}
                        · {layoutLabel(card.layout || "text")} · order {card.sort_order}
                      </span>
                    </p>
                    <p className="mt-2 font-display text-xl">{card.title}</p>
                    {card.body && (
                      <p className="mt-2 text-sm leading-relaxed text-folia-ink/60">{card.body}</p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditingId(card.id);
                          setForm({
                            page_key: card.page_key,
                            title: card.title,
                            body: card.body || "",
                            image_url: card.image_url || "",
                            layout: card.layout || "text",
                            sort_order: card.sort_order,
                            is_active: card.is_active,
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(card.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {!items.length && (
                <p className="rounded-2xl border border-dashed border-folia-sand px-5 py-12 text-center text-sm text-folia-ink/50">
                  No cards in this section yet. Add one on the right.
                </p>
              )}
            </>
          )}
        </div>

        <form onSubmit={save} className="h-fit rounded-2xl border border-folia-sand bg-white/50 p-6">
          <h2 className="font-display text-2xl">{editingId ? "Edit card" : "Add new card"}</h2>
          <div className="mt-5 space-y-4">
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-folia-ink/50">
                Section
              </span>
              <select
                value={form.page_key}
                onChange={(e) => setForm((f) => ({ ...f, page_key: e.target.value }))}
                className="w-full rounded-xl border border-folia-sand bg-white px-3 py-2.5 text-sm outline-none focus:border-folia-moss"
              >
                {sections.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-folia-ink/50">
                Layout
              </span>
              <select
                value={form.layout}
                onChange={(e) => setForm((f) => ({ ...f, layout: e.target.value }))}
                className="w-full rounded-xl border border-folia-sand bg-white px-3 py-2.5 text-sm outline-none focus:border-folia-moss"
              >
                {layouts.map((l) => (
                  <option key={l.key} value={l.key}>
                    {l.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-folia-ink/45">{LAYOUT_HINTS[form.layout]}</p>
            </label>

            <div>
              <p className="mb-1.5 text-xs uppercase tracking-[0.14em] text-folia-ink/50">
                Card image {form.layout !== "text" ? "(required)" : "(optional)"}
              </p>
              {form.image_url ? (
                <div className="mb-3 overflow-hidden rounded-xl border border-folia-sand">
                  <SoftImage
                    src={form.image_url}
                    alt=""
                    className="h-36 w-full"
                    imgClassName="h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center rounded-full border border-folia-sand bg-white px-4 py-2 text-sm hover:border-folia-moss">
                  {uploading ? "Uploading…" : form.image_url ? "Replace image" : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={uploadImage}
                  />
                </label>
                {form.image_url && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setForm((f) => ({ ...f, image_url: "", layout: "text" }))}
                  >
                    Remove image
                  </Button>
                )}
              </div>
            </div>

            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-folia-ink/50">
                Body / text on the other side
              </span>
              <textarea
                rows={4}
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                className="w-full rounded-xl border border-folia-sand bg-white px-3 py-2.5 text-sm outline-none focus:border-folia-moss"
                placeholder="Write the message that sits beside or over the image"
              />
            </label>
            <Input
              label="Sort order"
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
            />
            <label className="flex items-center gap-2 text-sm text-folia-ink/70">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              />
              Show on storefront
            </label>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="submit">{editingId ? "Update card" : "Add card"}</Button>
              {editingId && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingId(null);
                    setForm({ ...empty, page_key: pageKey });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
