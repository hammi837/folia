export default function Input({
  label,
  id,
  error,
  className = "",
  type = "text",
  ...rest
}) {
  const inputId = id || rest.name;
  return (
    <label className={`block ${className}`}>
      {label && (
        <span className="mb-1.5 block text-xs font-medium uppercase tracking-[0.14em] text-folia-ink/60">
          {label}
        </span>
      )}
      <input
        id={inputId}
        type={type}
        className={`w-full rounded-xl border bg-white/60 px-4 py-3 text-sm outline-none transition focus:border-folia-moss focus:ring-2 focus:ring-folia-moss/15 ${
          error ? "border-red-400" : "border-folia-sand"
        }`}
        {...rest}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
