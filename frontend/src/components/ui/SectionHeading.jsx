export default function SectionHeading({ eyebrow, title, subtitle, align = "left", className = "" }) {
  const alignClass = align === "center" ? "text-center mx-auto" : "";
  return (
    <div className={`max-w-2xl ${alignClass} ${className}`}>
      {eyebrow && (
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-folia-moss">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 font-display text-3xl leading-tight md:text-4xl text-balance">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-folia-ink/65 leading-relaxed">{subtitle}</p>}
    </div>
  );
}
