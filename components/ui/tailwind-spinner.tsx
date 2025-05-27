import React from 'react'

export default function TailwindSpinner() {
  return (
    <div className="flex flex-col items-center justify-center p-5 min-h-[200px] w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      <p className="mt-4 text-lg font-medium">Loading SlideIn...</p>
    </div>
  )
} 