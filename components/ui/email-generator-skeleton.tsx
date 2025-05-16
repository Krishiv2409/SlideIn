import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function EmailGeneratorSkeleton() {
  return (
    <Card className="shadow-none border-none w-full max-w-2xl mx-auto">
      <CardContent className="pt-6 px-4 sm:px-6">
        <div className="space-y-6">
          {/* URL input */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-72" /> {/* Label */}
            <Skeleton className="h-10 w-full rounded-md" /> {/* Input */}
          </div>
          
          {/* Goal dropdown */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" /> {/* Label */}
            <Skeleton className="h-10 w-full rounded-md" /> {/* Select */}
          </div>
          
          {/* Email tone section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-24" /> {/* Label */}
              <Skeleton className="h-5 w-32" /> {/* Warmth level */}
            </div>
            
            <Skeleton className="h-6 w-full" /> {/* Slider */}
            
            {/* Tone selector cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
              <Skeleton className="h-20 w-full rounded-md" />
            </div>
          </div>
          
          {/* Generate button */}
          <Skeleton className="h-11 w-full rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
} 