import { motion } from "framer-motion";
import { mediaUrl } from "../../lib/mediaUrl";

function pad(n) {
  return String(n).padStart(2, "0");
}

/**
 * Storefront content card with optional image layouts:
 * text | background | image_left | image_right
 */
export default function ContentCardView({
  card,
  index = 0,
  reduced = false,
  tone = "light",
  showIndex = true,
  className = "",
}) {
  const layout = card.layout || "text";
  const body = card.body || card.copy || "";
  const image = mediaUrl(card.image_url);
  const onDark = tone === "onDark";
  const delay = Math.min(index * 0.06, 0.24);

  const titleClass = onDark
    ? "font-display text-2xl text-folia-cream md:text-3xl"
    : "font-display text-2xl text-folia-ink";
  const bodyClass = onDark
    ? "mt-3 text-sm leading-relaxed text-folia-cream/70"
    : "mt-3 text-sm leading-relaxed text-folia-ink/60";
  const indexClass = onDark
    ? "text-[11px] uppercase tracking-[0.2em] text-folia-cream/50"
    : "text-[11px] uppercase tracking-[0.2em] text-folia-moss";

  const TextBlock = (
    <div className="relative z-[1] flex h-full flex-col justify-end p-6 md:p-7">
      {showIndex && <p className={indexClass}>{pad(index + 1)}</p>}
      <h3 className={`${showIndex ? "mt-3" : ""} ${titleClass}`}>{card.title}</h3>
      {body && <p className={bodyClass}>{body}</p>}
    </div>
  );

  // Full background image + overlay text
  if (layout === "background" && image) {
    return (
      <motion.article
        className={`group relative min-h-[16rem] overflow-hidden rounded-[1.5rem] border border-folia-sand shadow-soft ${className}`}
        initial={reduced ? false : { opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55, delay }}
      >
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-folia-ink/80 via-folia-ink/35 to-folia-ink/10" />
        <div className="relative z-[1] flex min-h-[16rem] flex-col justify-end p-6 text-folia-cream md:p-7">
          {showIndex && (
            <p className="text-[11px] uppercase tracking-[0.2em] text-folia-cream/55">{pad(index + 1)}</p>
          )}
          <h3 className={`${showIndex ? "mt-3" : ""} font-display text-2xl md:text-3xl`}>{card.title}</h3>
          {body && <p className="mt-3 max-w-md text-sm leading-relaxed text-folia-cream/75">{body}</p>}
        </div>
      </motion.article>
    );
  }

  // Split: image left or right, text on the other side
  if ((layout === "image_left" || layout === "image_right") && image) {
    const imageFirst = layout === "image_left";
    const imagePane = (
      <div className="relative min-h-[11rem] overflow-hidden bg-folia-sand/50 md:min-h-full">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      </div>
    );
    const textPane = (
      <div className={`flex flex-col justify-center ${onDark ? "" : "bg-white"}`}>{TextBlock}</div>
    );
    return (
      <motion.article
        className={`overflow-hidden rounded-[1.5rem] border border-folia-sand bg-white shadow-soft ${
          onDark ? "border-folia-cream/15 bg-folia-ink/40" : ""
        } ${className}`}
        initial={reduced ? false : { opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55, delay }}
      >
        <div className="grid h-full min-h-[14rem] md:grid-cols-2">
          {imageFirst ? (
            <>
              {imagePane}
              {textPane}
            </>
          ) : (
            <>
              {textPane}
              {imagePane}
            </>
          )}
        </div>
      </motion.article>
    );
  }

  // Text only (default)
  return (
    <motion.article
      className={`rounded-[1.5rem] border border-folia-sand bg-white p-6 shadow-soft transition hover:border-folia-moss ${
        onDark ? "border-folia-cream/15 bg-folia-ink/35 hover:border-folia-cream/35" : ""
      } ${className}`}
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay }}
    >
      {showIndex && <p className={indexClass}>{pad(index + 1)}</p>}
      <h3 className={`${showIndex ? "mt-3" : "mt-0"} ${titleClass} ${onDark ? "" : ""}`}>
        {card.title}
      </h3>
      {body && <p className={bodyClass}>{body}</p>}
    </motion.article>
  );
}

/** Wider span for media layouts inside CSS grids */
export function contentCardSpanClass(card, { cols = 3 } = {}) {
  const layout = card?.layout || "text";
  if (layout === "text" || !card?.image_url) return "";
  if (cols >= 3) return "sm:col-span-2 lg:col-span-2";
  if (cols === 2) return "sm:col-span-2";
  return "col-span-full";
}
