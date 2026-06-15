import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary";
  size?: "sm" | "md" | "lg";
  rounded?: "xl" | "2xl" | "full";
  loading?: boolean;
  destructive?: boolean;
  icon?: ReactNode;
}

export const Button = ({
  variant = "primary",
  size = "md",
  rounded = "xl",
  loading = false,
  destructive = false,
  icon,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) => {
  const base =
    "inline-flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none";

  const variantStyles = destructive
    ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
    : {
        primary:
          "bg-[#9d9df0] hover:bg-[#8c8cdf] text-white shadow-lg shadow-indigo-900/20",
        secondary:
          "bg-white border-2 border-gray-100 hover:bg-gray-50 text-gray-700",
        tertiary:
          "bg-gray-50 border-2 border-transparent hover:bg-gray-100 text-gray-600",
      }[variant];

  const sizes = {
    sm: "px-4 py-2.5 text-sm",
    md: "px-6 py-3.5 text-sm",
    lg: "px-6 py-4 text-lg",
  };

  const roundedStyles = {
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  };

  const isLightText = variant === "primary" || destructive;

  return (
    <button
      className={`${base} ${variantStyles} ${sizes[size]} ${roundedStyles[rounded]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div
          className={`w-5 h-5 border-2 rounded-full animate-spin ${
            isLightText
              ? "border-white/30 border-t-white"
              : "border-gray-300 border-t-gray-600"
          }`}
        />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
};
