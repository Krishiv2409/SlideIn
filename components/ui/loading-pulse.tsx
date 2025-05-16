import { cn } from "@/lib/utils"

export function LoadingPulse({ className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-6">
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Outer circle */}
        <div className="absolute h-full w-full animate-ping rounded-full bg-primary opacity-20" />
        
        {/* Inner circle */}
        <div className="absolute h-3/4 w-3/4 animate-pulse rounded-full bg-primary opacity-40" />
        
        {/* Center dot */}
        <div className="h-1/2 w-1/2 rounded-full bg-primary" />
      </div>
      
      <div className={cn("text-center", className)}>
        <p className="text-lg font-medium text-primary">Loading</p>
        <p className="text-sm text-muted-foreground">Please wait...</p>
      </div>
    </div>
  )
} 