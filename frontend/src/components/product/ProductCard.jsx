import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Badge from "../ui/Badge";

export default function ProductCard({ product }) {
  const image = product.images?.[0]?.url || product.image_url;
  const price = Number(product.price);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45 }}
      className="group"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-folia-sand/40">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-folia-ink/40">
              FOLIA
            </div>
          )}
          {product.is_featured && (
            <div className="absolute left-3 top-3">
              <Badge>Ritual pick</Badge>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg leading-snug">{product.name}</h3>
            <p className="mt-1 text-sm text-folia-ink/55 line-clamp-1">
              {product.short_description || product.category?.name}
            </p>
          </div>
          <p className="shrink-0 text-sm font-medium">${price.toFixed(2)}</p>
        </div>
      </Link>
    </motion.article>
  );
}
