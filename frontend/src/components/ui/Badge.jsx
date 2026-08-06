export default function Badge({ children, tone = "moss", className = "" }) {
  const tones = {
    moss: "bg-folia-mist text-folia-moss",
    blush: "bg-folia-blush/20 text-folia-ink",
    sand: "bg-folia-sand/60 text-folia-ink/80",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
