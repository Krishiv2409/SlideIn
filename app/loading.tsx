import React from 'react'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] w-full">
      <div className="relative h-20 w-20">
        {/* Outer circle */}
        <div className="absolute h-full w-full rounded-full border-4 border-t-transparent border-primary animate-[spin_1s_linear_infinite]" />
        
        {/* Inner circle */}
        <div className="absolute top-2 left-2 h-16 w-16 rounded-full border-4 border-t-transparent border-primary animate-[spin_1.2s_linear_infinite_reverse]" />
      </div>
      <p className="mt-4 text-lg font-medium">Loading SlideIn...</p>
    </div>
  )
} 