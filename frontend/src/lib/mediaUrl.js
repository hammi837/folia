/**
 * Turn relative media paths (/uploads/...) into absolute URLs for production
 * where the API and Vercel frontend live on different hosts.
 */
export function mediaUrl(src) {
  if (!src) return null;
  if (/^https?:\/\//i.test(src) || src.startsWith("data:")) return src;
  if (!src.startsWith("/")) return src;

  const api = import.meta.env.VITE_API_URL || "";
  // VITE_API_URL is like https://api.example.com/api/v1 → origin is before /api
  const origin = api.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
  if (!origin || origin.startsWith("/")) return src;
  return `${origin}${src}`;
}
