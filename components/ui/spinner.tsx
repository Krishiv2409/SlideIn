import { cn } from "@/lib/utils"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

export function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-4",
  }

  return (
    <div
      className={cn(
        "inline-block animate-custom-spin rounded-full border-current border-t-transparent text-primary",
        sizeClasses[size],
        className
      )}
      style={{
        borderWidth: size === "lg" ? "4px" : size === "md" ? "3px" : "2px"
      }}
      {...props}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
} 