"use client"

import { ContentWrapper } from "@/components/content-wrapper"
import { BarChart3, ChevronRight } from "lucide-react"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <ContentWrapper>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
          <span className="text-gray-900 font-medium">SlideIn</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-pink-500 font-medium">Analytics</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1 font-display">Analytics</h1>
            <p className="text-gray-500">Track your email performance metrics and insights</p>
          </div>
          <div className="bg-pink-50 p-3 rounded-full">
            <BarChart3 className="h-6 w-6 text-pink-500" />
          </div>
        </div>
      </div>
      <div className="w-full">
        <AnalyticsDashboard />
      </div>
    </ContentWrapper>
  )
} 