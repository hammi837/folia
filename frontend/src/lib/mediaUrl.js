/**
 * Turn relative media paths (/uploads/...) into absolute URLs for production
 * where the API and Vercel frontend live on different hosts.
 */
export function mediaUrl(src) {
  if (!src) return null;
  if (/^https?:\/\//i.test(src) || src.startsWith("data:")) return src;
  if (!src.startsWith("/")) return src;

  let api = String(import.meta.env.VITE_API_URL || "").trim();
  if (api && !/^https?:\/\//i.test(api)) {
    api = `https://${api}`;
  }

  let origin = api.replace(/\/api\/v1\/?$/i, "").replace(/\/$/, "");
  if (!origin || origin.startsWith("/")) {
    // Safe production fallback when VITE_API_URL is missing/mis-set
    if (import.meta.env.PROD) {
      origin = "https://folia-production-c0f7.up.railway.app";
    } else {
      return src;
    }
  }

  return `${origin}${src}`;
}
