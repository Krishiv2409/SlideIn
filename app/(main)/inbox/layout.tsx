import React from 'react'

export default function InboxLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full h-full flex justify-center px-6 py-8">
      <div className="w-full">
        {children}
      </div>
    </div>
  )
} 