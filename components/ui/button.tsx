import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover",
  secondary:
    "border border-border text-text-primary hover:border-text-secondary",
  danger:
    "bg-danger text-white hover:bg-[#8A3535]",
  ghost:
    "text-text-secondary hover:text-text-primary",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`inline-flex items-center justify-center rounded-sm px-5 py-2.5 font-medium transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${variantStyles[variant]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button };
export type { ButtonProps };
