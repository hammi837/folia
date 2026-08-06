import { Link } from "react-router-dom";

const variants = {
  primary:
    "bg-folia-moss text-folia-cream hover:bg-folia-ink border border-transparent",
  secondary:
    "bg-transparent text-folia-ink border border-folia-ink/20 hover:border-folia-moss hover:text-folia-moss",
  ghost: "bg-transparent text-folia-ink/80 hover:text-folia-moss border border-transparent",
  light:
    "bg-folia-cream text-folia-ink border border-transparent hover:bg-white",
};

const sizes = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-3.5 text-sm",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  to,
  className = "",
  type = "button",
  disabled,
  onClick,
  ...rest
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition duration-200 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}
