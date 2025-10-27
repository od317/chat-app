"use client";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated";
}

/**
 * Card component for consistent container styling
 * Why forwardRef? Allows grid/flex parent layouts to measure card dimensions
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = "", variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-highlights/50 backdrop-blur-sm border border-highlights/30",
      elevated:
        "bg-highlights/80 backdrop-blur-sm shadow-xl border border-highlights/50",
    };

    return (
      <div
        ref={ref}
        className={`rounded-2xl p-6 transition-all duration-300 ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
