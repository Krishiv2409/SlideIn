import { cn } from "@/lib/utils"

interface LoadingDotsProps {
  className?: string
  color?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingDots({ 
  className, 
  color = "currentColor",
  size = "md"
}: LoadingDotsProps) {
  const sizeClasses = {
    sm: "h-1 w-1 mx-0.5",
    md: "h-2 w-2 mx-1",
    lg: "h-3 w-3 mx-1.5",
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex space-x-1">
        <div
          className={cn(
            "animate-[bounce_1s_infinite_0ms] rounded-full",
            sizeClasses[size]
          )}
          style={{ backgroundColor: color }}
        />
        <div
          className={cn(
            "animate-[bounce_1s_infinite_250ms] rounded-full",
            sizeClasses[size]
          )}
          style={{ backgroundColor: color }}
        />
        <div
          className={cn(
            "animate-[bounce_1s_infinite_500ms] rounded-full",
            sizeClasses[size]
          )}
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  )
} 