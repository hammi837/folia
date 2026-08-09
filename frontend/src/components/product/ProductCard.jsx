import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Badge from "../ui/Badge";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

export default function ProductCard({ product, index = 0 }) {
  const image = product.images?.[0]?.url || product.image_url;
  const price = Number(product.sale_price ?? product.price);
  const base = Number(product.price);
  const onSale = product.applied_discount_percent && price < base;
  const reduced = usePrefersReducedMotion();

  return (
    <motion.article
      layout
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.06, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-folia-sand bg-folia-sand/50">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-cover transition duration-[900ms] ease-out group-hover:scale-[1.07]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-folia-ink/40">
              FOLIA
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-folia-ink/0 transition duration-500 group-hover:bg-folia-ink/20" />
          <div className="absolute inset-x-0 bottom-0 translate-y-3 p-4 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="inline-flex rounded-full bg-folia-cream/95 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-folia-ink">
              View ritual
            </span>
          </div>

          {product.is_featured && (
            <div className="absolute left-3 top-3">
              <Badge>Ritual pick</Badge>
            </div>
          )}
          {onSale && (
            <div className="absolute right-3 top-3">
              <Badge tone="blush">−{Number(product.applied_discount_percent)}%</Badge>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg leading-snug transition group-hover:text-folia-moss">
              {product.name}
            </h3>
            <p className="mt-1 text-sm text-folia-ink/55 line-clamp-1">
              {product.short_description || product.category?.name}
            </p>
          </div>
          <div className="shrink-0 text-right text-sm font-medium">
            {onSale && <p className="text-xs text-folia-ink/40 line-through">${base.toFixed(2)}</p>}
            <p>${price.toFixed(2)}</p>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
