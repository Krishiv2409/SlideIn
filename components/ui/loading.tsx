import { Spinner } from "./spinner"
import { cn } from "@/lib/utils"

interface LoadingProps {
  text?: string
  className?: string
  spinnerSize?: "sm" | "md" | "lg"
}

export function Loading({ 
  text = "Loading", 
  className,
  spinnerSize = "md" 
}: LoadingProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[120px] p-4", className)}>
      <Spinner size={spinnerSize} className="mb-3" />
      {text && <p className="text-sm font-medium text-primary animate-pulse-bright">{text}</p>}
    </div>
  )
} 