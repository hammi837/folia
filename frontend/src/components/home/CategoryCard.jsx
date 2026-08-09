import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CATEGORY_VISUALS } from "../../lib/motion";
import SoftImage from "../ui/SoftImage";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

export default function CategoryCard({ category, index = 0 }) {
  const reduced = usePrefersReducedMotion();
  const tagline =
    category.description || CATEGORY_VISUALS[category.slug]?.tagline || "Explore the edit";

  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <Link to={`/shop?category=${category.slug}`} className="block overflow-hidden">
        <div className="relative aspect-[3/4] overflow-hidden bg-folia-sand/50">
          <SoftImage
            src={category.image_url || null}
            alt={category.name}
            className="absolute inset-0 h-full w-full"
            imgClassName="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-folia-ink/75 via-folia-ink/15 to-transparent transition duration-500 group-hover:from-folia-ink/85" />

          <div className="absolute inset-x-0 bottom-0 p-5 text-folia-cream md:p-6">
            <p className="text-[10px] uppercase tracking-[0.28em] text-folia-cream/60">Collection</p>
            <h3 className="mt-2 font-display text-2xl md:text-3xl">{category.name}</h3>
            <p className="mt-2 max-w-[16rem] text-sm text-folia-cream/70 opacity-90">{tagline}</p>
            <span className="mt-4 inline-flex translate-y-2 items-center text-xs uppercase tracking-[0.2em] text-folia-cream/80 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
              Explore →
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
