import { Mail } from 'lucide-react'

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-md bg-pink-500 text-white ${className}`}>
      <Mail className="h-1/2 w-1/2" />
    </div>
  )
} 