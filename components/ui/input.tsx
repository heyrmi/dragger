import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`rounded-sm border border-border bg-bg-primary px-4 py-2.5 text-text-primary placeholder-text-secondary transition-colors focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none ${error ? "border-danger" : ""} ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
