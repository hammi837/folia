import { useState } from "react";

/**
 * Renders an image when `src` is set; otherwise a soft brand placeholder.
 * No hardcoded remote image URLs.
 */
export default function SoftImage({
  src,
  alt = "",
  className = "",
  imgClassName = "h-full w-full object-cover",
  placeholderLabel = "FOLIA",
}) {
  const [broken, setBroken] = useState(false);
  const showImg = Boolean(src) && !broken;

  if (!showImg) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-folia-mist via-folia-sand/60 to-folia-moss/25 ${className}`}
        role="img"
        aria-label={alt || placeholderLabel}
      >
        <span className="font-display text-sm tracking-[0.2em] text-folia-ink/25">{placeholderLabel}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${imgClassName} ${className}`}
      onError={() => setBroken(true)}
    />
  );
}
