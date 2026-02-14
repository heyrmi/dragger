import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-sm border border-border bg-bg-card p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
