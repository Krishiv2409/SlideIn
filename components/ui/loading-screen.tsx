import { Spinner } from "./spinner"
import { LoadingDots } from "./loading-dots"
import { cn } from "@/lib/utils"

interface LoadingScreenProps {
  text?: string
  className?: string
}

export function LoadingScreen({ 
  text = "Loading", 
  className 
}: LoadingScreenProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[200px] w-full p-6",
      className
    )}>
      <Spinner size="lg" className="mb-4" />
      <div className="flex items-center space-x-2">
        <p className="text-base font-medium text-primary">{text}</p>
        <LoadingDots color="hsl(var(--primary))" size="sm" />
      </div>
    </div>
  )
} 