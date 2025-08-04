
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "white";
}

export function Logo({ className, size = "md", variant = "primary" }: LogoProps) {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl", 
    lg: "text-3xl",
  };

  const variantClasses = {
    primary: "text-hashim-600",
    white: "text-white",
  };

  return (
    <div 
      className={cn(
        "font-bold select-none flex items-center", 
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      <span className="mr-1">Hashim</span>
      <span className="bg-hashim-600 text-white px-2 py-0.5 rounded-md">Fit</span>
    </div>
  );
}
