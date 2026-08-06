import Button from "./Button";

export default function EmptyState({ title, description, actionLabel, actionTo }) {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <h2 className="font-display text-2xl">{title}</h2>
      {description && <p className="mt-3 text-folia-ink/65">{description}</p>}
      {actionLabel && actionTo && (
        <div className="mt-8 flex justify-center">
          <Button to={actionTo}>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
}
