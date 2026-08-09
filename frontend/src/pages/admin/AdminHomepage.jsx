import { useEffect, useState } from "react";
import api from "../../services/api";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import SoftImage from "../../components/ui/SoftImage";
import Spinner from "../../components/ui/Spinner";
import { useUiStore } from "../../store/uiStore";

const EMPTY = {
  hero_image_url: "",
  about_hero_image_url: "",
  about_story_image_url: "",
  about_ritual_image_url: "",
  quiz_image_url: "",
};

const FIELDS = [
  {
    key: "hero_image_url",
    title: "Home hero",
    hint: "Full-bleed image on the storefront home page",
  },
  {
    key: "about_hero_image_url",
    title: "About — top hero",
    hint: "Big opening image on /about",
  },
  {
    key: "about_story_image_url",
    title: "About — story panel",
    hint: "Image beside “Why we exist”",
  },
  {
    key: "about_ritual_image_url",
    title: "About — ritual section",
    hint: "Background behind “Three steps. That’s the ritual.”",
  },
  {
    key: "quiz_image_url",
    title: "Skin quiz panel",
    hint: "Side image on /quiz",
  },
];

export default function AdminHomepage() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState(null);
  const showToast = useUiStore((s) => s.showToast);

  useEffect(() => {
    api
      .get("/admin/settings")
      .then((r) =>
        setForm({
          hero_image_url: r.data.hero_image_url || "",
          about_hero_image_url: r.data.about_hero_image_url || "",
          about_story_image_url: r.data.about_story_image_url || "",
          about_ritual_image_url: r.data.about_ritual_image_url || "",
          quiz_image_url: r.data.quiz_image_url || "",
        })
      )
      .catch(() => setForm(EMPTY))
      .finally(() => setLoading(false));
  }, []);

  const uploadImage = async (key, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingKey(key);
    try {
      const body = new FormData();
      body.append("file", file);
      const { data } = await api.post("/admin/upload", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({ ...f, [key]: data.url }));
      showToast("Image uploaded — click Save to publish");
    } catch {
      showToast("Upload failed");
    } finally {
      setUploadingKey(null);
      e.target.value = "";
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      for (const key of Object.keys(EMPTY)) {
        payload[key] = form[key].trim() || null;
      }
      const { data } = await api.put("/admin/settings", payload);
      setForm({
        hero_image_url: data.hero_image_url || "",
        about_hero_image_url: data.about_hero_image_url || "",
        about_story_image_url: data.about_story_image_url || "",
        about_ritual_image_url: data.about_ritual_image_url || "",
        quiz_image_url: data.quiz_image_url || "",
      });
      showToast("Site images updated");
    } catch (err) {
      showToast(err.response?.data?.detail || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-4xl">Site images</h1>
      <p className="mt-2 text-sm text-folia-ink/55">
        All storefront photos come from here (or Products / Categories / Offers). No hardcoded image
        URLs in the app — upload or leave blank for a soft placeholder.
      </p>

      <form onSubmit={save} className="mt-8 max-w-3xl space-y-6">
        {FIELDS.map((field) => (
          <div key={field.key} className="space-y-3 rounded-2xl border border-folia-sand bg-white/60 p-5">
            <div>
              <h2 className="font-display text-2xl">{field.title}</h2>
              <p className="mt-1 text-sm text-folia-ink/50">{field.hint}</p>
            </div>
            <label className="block text-xs font-medium uppercase tracking-[0.14em] text-folia-ink/60">
              Upload image
              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadImage(field.key, e)}
                className="mt-1.5 block w-full text-sm"
              />
            </label>
            {uploadingKey === field.key && <p className="text-xs text-folia-moss">Uploading…</p>}
            <Input
              label="Or image URL (uploaded path or external)"
              value={form[field.key] || ""}
              onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
              placeholder="/uploads/products/..."
            />
            <div className="overflow-hidden rounded-xl border border-folia-sand">
              <SoftImage
                src={form[field.key] || null}
                alt=""
                className="aspect-[16/9] w-full"
                imgClassName="aspect-[16/9] w-full object-cover"
              />
            </div>
            {form[field.key] && (
              <button
                type="button"
                className="text-xs text-folia-ink/50 hover:text-folia-moss"
                onClick={() => setForm((f) => ({ ...f, [field.key]: "" }))}
              >
                Clear image
              </button>
            )}
          </div>
        ))}

        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save all images"}
        </Button>
      </form>
    </div>
  );
}
