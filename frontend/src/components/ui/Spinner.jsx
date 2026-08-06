export default function Spinner({ className = "h-6 w-6" }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-folia-sand border-t-folia-moss ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
