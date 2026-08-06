import { useParams } from "react-router-dom";

export default function ProductDetail() {
  const { slug } = useParams();
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display text-4xl">Product</h1>
      <p className="mt-2 text-folia-ink/60">Slug: {slug}</p>
    </section>
  );
}
